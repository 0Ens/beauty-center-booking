/*
 * DEMO YÖNETİCİ HESABI (sadece SITE_MODE=demo)
 *
 * Portföy demosunda ziyaretçiler giriş sayfasındaki "Demo olarak gir" düğmesiyle
 * ortak bir demo hesabına girer. Bu hesapla randevular onaylanıp iptal edilebilir;
 * sitede herkese görünen içeriği değiştiren ayarlar (işlemler, çalışma saatleri,
 * izin günleri, öncesi/sonrası galerisi) kilitlidir.
 *
 * Kilit iki katmanlı:
 *   1) Sunucu: Server Action'lar bu hesapta DEMO_LOCKED_MESSAGE döner (kullanıcı dostu mesaj)
 *   2) Veritabanı: supabase/demo/demo_admin.sql → RESTRICTIVE RLS politikaları
 *      (oturum anahtarını kopyalayıp Supabase'e doğrudan istek atan biri de yazamaz)
 *
 * Hesabın e-posta ve şifresi sadece sunucudaki ortam değişkenlerinde durur:
 * DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD (NEXT_PUBLIC_ ALMAZ).
 */

export const DEMO_LOCKED_MESSAGE =
  "Demoda kapalı: bu ayar sitede herkesin gördüğü içeriği değiştirdiği için demo hesabında kaydedilemez. Randevuları onaylayıp iptal edebilirsiniz.";

/** Giriş yapan hesap, ortam değişkenindeki demo hesabı mı? (büyük/küçük harf ve boşluk fark etmez) */
export function isDemoAdminEmail(email: string, demoEmail: string | undefined): boolean {
  const target = demoEmail?.trim().toLowerCase();
  if (!target) return false;
  return email.trim().toLowerCase() === target;
}
