/*
 * SİTE MODU: aynı kod üç farklı şekilde yayınlanabilir.
 * Ortam değişkeni SITE_MODE ile seçilir (Vercel/Netlify → Environment variables).
 *
 *   production (ya da boş) → gerçek salon sitesi: normal randevu, e-posta bildirimi
 *   staging                → yayın öncesi deneme adresi: Google'a kapalı (noindex),
 *                            "deneme sürümü" şeridi, SADECE adı "TEST" ile başlayan
 *                            randevular kaydedilir
 *   demo                   → portföy demosu: Google'a kapalı, "demo" şeridi.
 *                            Randevu veritabanına GERÇEKTEN yazılır ama ad ve telefonu
 *                            sunucu uydurur (demoIdentity.ts); kişisel veri toplanmaz.
 *
 * NEXT_PUBLIC_ ALMIYOR: sadece sunucuda (ve build sırasında) okunuyor. Tarayıcıdaki
 * bileşenlere gerekiyorsa sunucu bileşeni prop olarak verir (ör. BookingForm).
 */
export type SiteMode = "production" | "staging" | "demo";

export function parseSiteMode(raw: string | undefined): SiteMode {
  const value = raw?.trim().toLowerCase() ?? "";
  if (value === "" || value === "production") return "production";
  if (value === "staging" || value === "demo") return value;
  // Yazım hatası (ör. "dmeo") sessizce "production" sayılsaydı demo sitesi
  // gerçek kişisel veri toplamaya başlardı. Bu yüzden build/sunucu HATA verir.
  throw new Error(`SITE_MODE tanınmadı: "${raw}". Geçerli değerler: production, staging, demo (ya da boş).`);
}

export const siteMode = parseSiteMode(process.env.SITE_MODE);
export const isStaging = siteMode === "staging";
export const isDemo = siteMode === "demo";
/** Gerçek site dışındaki her mod arama motorlarına kapalı */
export const isNoIndex = siteMode !== "production";

/*
 * Deneme sürümünde SADECE test randevusu kabul ediyoruz: ad "TEST" ile
 * başlamalı. Siteyi şans eseri bulan gerçek bir kişinin adı ve telefonu
 * hiç kaydedilmesin. Büyük/küçük harf fark etmez: "TEST Ayşe", "test ayşe".
 */
export function isTestBookingName(name: string): boolean {
  return /^test/i.test(name.trim());
}
