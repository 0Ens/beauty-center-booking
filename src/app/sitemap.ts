import type { MetadataRoute } from "next";
import { getServices } from "@/data/services";
import { navLinks } from "@/lib/site";
import { siteUrl } from "@/lib/siteUrl";

/*
 * sitemap.xml: Google'a sitedeki sayfaların listesi.
 * Menüdeki sayfalar + randevu + KVKK + her işlemin detay sayfası.
 * Yeni işlem eklenince listeye kendiliğinden girer (getServices'in önbelleği
 * panelde işlem kaydedilince yenileniyor).
 *
 * lastModified / priority / changeFrequency vermiyoruz: Google priority ve
 * changeFrequency'yi yok sayıyor, doğru bilmediğimiz bir tarih vermek de
 * hiç vermemekten kötü.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getServices();

  const pages = [...navLinks.map((link) => link.href), "/rezervasyon", "/kvkk"];

  return [
    ...pages.map((path) => ({ url: `${siteUrl}${path}` })),
    ...services.map((service) => ({ url: `${siteUrl}/islemlerimiz/${service.slug}` })),
  ];
}
