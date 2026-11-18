import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteUrl";

/*
 * robots.txt: arama motoru botlarına "nereye girebilirsin" der.
 * Bu bir RİCA, güvenlik değil: kötü niyetli bot umursamaz. Panelin asıl
 * koruması girişte (proxy + RLS). Panel sayfalarında ayrıca "noindex" de var.
 */
export default function robots(): MetadataRoute.Robots {
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
