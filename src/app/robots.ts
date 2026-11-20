import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteUrl";
import { isStaging } from "@/lib/staging";

/*
 * robots.txt: arama motoru botlarına "nereye girebilirsin" der.
 * Bu bir RİCA, güvenlik değil: kötü niyetli bot umursamaz. Panelin asıl
 * koruması girişte (proxy + RLS). Panel sayfalarında ayrıca "noindex" de var.
 */
export default function robots(): MetadataRoute.Robots {
  if (isStaging) {
    /*
     * DENEME SÜRÜMÜ: burada "disallow: /" YAZMIYORUZ, bilerek.
     * Google, girmesi yasak sayfayı hiç okumaz → içindeki "noindex"i de
     * göremez; başka bir yerde link görürse adresi yine listeleyebilir.
     * Bu yüzden girmesine izin veriyoruz; her cevapta "noindex" başlığını
     * (next.config) görüp hiçbir sayfayı dizine eklemiyor.
     * Sitemap'i de vermiyoruz: deneme adresini Google'a kendimiz tanıtmayalım.
     */
    return { rules: { userAgent: "*", allow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Yönetim paneli ve "randevunuz alındı" sayfası aramada çıkmasın
      disallow: ["/admin", "/rezervasyon/tamam"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
