/*
 * SİTENİN TAM ADRESİ (ör. "https://ornek-salon.com.tr")
 *
 * Neden lazım? Sayfa içindeki linkler "/islemlerimiz" gibi göreli olabilir,
 * ama site DIŞINA giden her şey tam adres ister:
 *   - sitemap.xml ve robots.txt (Google okuyor)
 *   - paylaşım önizlemesi (og:image): WhatsApp/Instagram görseli bu adresten çeker
 *   - Google'a verdiğimiz işletme bilgisi (JSON-LD)
 *
 * Adres bir ortam değişkeninden
 * geliyor; boşsa geliştirme adresi kullanılıyor. Yayına alırken barındırma
 * panelinde NEXT_PUBLIC_SITE_URL'yi gerçek adresle doldurmak ŞART.
 */
const DEV_URL = "http://localhost:3000";

/** Boşsa geliştirme adresi; sondaki "/" silinir ki `${siteUrl}/kvkk` iki eğik çizgi üretmesin. */
export function normalizeSiteUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return DEV_URL;
  return value.replace(/\/+$/, "");
}

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

if (process.env.NODE_ENV === "production" && siteUrl === DEV_URL) {
  // Sessiz kalsaydı sitemap'te "localhost" adresleri olurdu ve kimse fark etmezdi.
  console.warn("[siteUrl] NEXT_PUBLIC_SITE_URL boş: sitemap ve paylaşım linkleri localhost'u gösterecek.");
}
