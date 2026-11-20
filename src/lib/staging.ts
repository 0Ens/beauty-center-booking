/*
 * DENEME SÜRÜMÜ (STAGING) BAYRAĞI
 *
 * Gerçek müşteriye açılmadan önce site internette bir "deneme" adresinde
 * (ör. xxx.netlify.app) yayında olacak. Orada:
 *   - Google siteyi dizine EKLEMESİN (next.config → X-Robots-Tag başlığı)
 *   - Ziyaretçi bunun deneme olduğunu GÖRSÜN ((site)/layout → uyarı şeridi)
 *
 * Netlify'da ortam değişkeni olarak SITE_STAGING=1 girilir. Gerçek açılışta
 * (sıradaki 10. adım) bu değişken silinir; kodda hiçbir şey değişmez.
 *
 * NEXT_PUBLIC_ ALMIYOR: sadece sunucuda (ve build sırasında) okunuyor,
 * tarayıcıya gitmesine gerek yok.
 */
export function isStagingFlag(raw: string | undefined): boolean {
  // Sadece açıkça "1" ya da "true" ise deneme modu. Boş, "0", "false",
  // yazım hatası… hepsi "gerçek site" sayılır.
  const value = raw?.trim().toLowerCase();
  return value === "1" || value === "true";
}

export const isStaging = isStagingFlag(process.env.SITE_STAGING);

/*
 * Deneme sürümünde SADECE test randevusu kabul ediyoruz: ad "TEST" ile
 * başlamalı. Siteyi şans eseri bulan gerçek bir kişinin adı ve telefonu
 * hiç kaydedilmesin (KVKK: deneme sürecinde gerçek kişisel veri toplanmaz).
 * Büyük/küçük harf fark etmez: "TEST Ayşe", "test ayşe" ikisi de geçer.
 */
export function isTestBookingName(name: string): boolean {
  return /^test/i.test(name.trim());
}
