import { getWorkingHoursRows } from "@/data/workingHours";
import { toOpeningHoursSpecification } from "@/lib/openingHours";
import { toInternational } from "@/lib/phone";
import { site } from "@/lib/site";
import { siteUrl } from "@/lib/siteUrl";

/*
 * GOOGLE İÇİN İŞLETME KARTI (JSON-LD, schema.org "BeautySalon")
 *
 * Ekranda hiçbir şey göstermez; sayfaya <script type="application/ld+json">
 * olarak gömülür. Google bunu okuyup "bu sayfa şu adreste, şu saatlerde
 * açık bir güzellik salonu" diye anlar.
 *
 * Asıl "Haritalarda çıkma" işi Google Business Profile'dan;
 * bu kart, site ile o profilin aynı işletme olduğunu doğrulamaya yardım eder.
 * Kontrol: https://search.google.com/test/rich-results (yayından sonra)
 */
export default async function LocalBusinessJsonLd() {
  const rows = await getWorkingHoursRows();
  const phone = toInternational(site.phone);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: site.name,
    description: site.description,
    url: siteUrl,
    image: `${siteUrl}/logo-mark.svg`,
    telephone: phone ? `+${phone}` : undefined, // ör. "+905001234567"
    address: {
      "@type": "PostalAddress",
      streetAddress: site.postalAddress.street,
      postalCode: site.postalAddress.postalCode,
      addressLocality: site.postalAddress.district,
      addressRegion: site.postalAddress.city,
      addressCountry: "TR",
    },
    hasMap: site.mapsUrl || undefined,
    sameAs: site.instagram ? [`https://www.instagram.com/${site.instagram}/`] : undefined,
    openingHoursSpecification: toOpeningHoursSpecification(rows),
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify "<" karakterini kaçırmaz: metinde "</script>" geçerse sayfaya
      // kod sızabilir (XSS). "<" yerine < yazınca JSON aynı kalır ama tehlike gider.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
