# Yeni bir salona uyarlama: kontrol listesi

Bu şablon bir güzellik merkezinin sitesini; randevu sistemi ve yönetim paneliyle
birlikte kurmak için hazırlandı. İşlemler, çalışma saatleri, izin günleri ve
öncesi/sonrası galerisi **veritabanında** tutulur ve salon sahibi bunları panelden
yönetir. Kodda değişmesi gerekenler yalnızca marka ayarlarıdır.

> **Ticari kullanım notu:** Vercel'in ücretsiz Hobby planı yalnızca ticari olmayan
> projeler içindir. Gerçek bir işletmenin sitesi için Vercel **Pro** ya da ticari
> kullanıma izin veren başka bir barındırma (ör. Netlify) kullanılmalı.

---

## 1. Marka ayarları (kod)

| Ne | Nerede |
| --- | --- |
| Ad, telefon, adres, sosyal medya, hakkımızda metni, e-posta gönderen adı, KVKK sağlayıcıları | `src/lib/site.ts` |
| Renkler | `src/app/globals.css` → **MARKA AYARLARI: RENKLER** bloğu |
| Fontlar | `src/app/layout.tsx` → **MARKA AYARLARI: FONTLAR** bloğu |
| Amblem (logo) | `public/logo-mark.svg` |
| Favicon | `src/app/icon.svg` |
| Paylaşım önizlemesi (WhatsApp/Instagram kartı) renkleri | `src/app/opengraph-image.tsx` |

- [ ] `site.ts` içindeki bütün alanları doldur. `whatsapp`, `instagram`, `mapsUrl`
      boş bırakılırsa ilgili düğmeler sitede otomatik gizlenir.
- [ ] Renkleri değiştirdiysen `icon.svg` ve `opengraph-image.tsx` içindeki renk
      kopyalarını da güncelle (bu iki dosya CSS değişkenlerini okuyamaz).
- [ ] Logo dosyasının kullanım hakkının salonda olduğundan emin ol.
- [ ] `npx vitest run`, `npx tsc --noEmit`, `npx eslint src` temiz geçmeli.

## 2. Supabase projesi

- [ ] Yeni bir Supabase projesi aç. Bölgeyi **sonradan değiştirilemez**, baştan seç
      ve KVKK metnindeki `site.kvkk.databaseLocation` ile aynı yaz.
- [ ] **Database → Extensions** bölümünden `pg_cron`'u etkinleştir (0014 bunu ister).
- [ ] **SQL Editor**'da `supabase/migrations/` içindeki dosyaları **sırayla**
      (0001 → 0015) çalıştır.
- [ ] Başlangıç işlemleri için `supabase/seed.sql`'i çalıştır, sonra panelden salonun
      gerçek işlem listesine göre düzenle.
- [ ] `supabase/demo/` klasöründeki dosyaları **çalıştırma**: o klasör sadece
      portföy demosu içindir ve her gece randevuları siler.

## 3. Yönetici hesabı

- [ ] **Authentication → Users → Add user** ile salon sahibinin hesabını aç
      (e-posta + güçlü şifre; şifreyi sahibi kendisi belirlesin).
- [ ] Hesabı yönetici yap (SQL Editor):
      ```sql
      insert into public.admins (user_id)
      select id from auth.users where email = 'SAHIBIN_EPOSTASI';
      ```
- [ ] **Authentication → Sign In / Providers** bölümünde yeni kayıtları kapat
      (*Allow new users to sign up* kapalı). Panel giriş yapan herkese değil, yalnızca
      `admins` tablosundakilere açıktır; kayıtları kapatmak ikinci kilittir.

## 4. Barındırma (Vercel veya Netlify) ve ortam değişkenleri

`.env.example` dosyası her değişkeni açıklıyor. Yayında girilmesi gerekenler:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL`: tam adres, `https://` ile, sonda `/` olmadan
- [ ] `SITE_MODE`: önce `staging` (deneme), yayına çıkarken boş ya da `production`
- [ ] `RESEND_API_KEY`, `BOOKING_NOTIFY_TO`, isteğe bağlı `BOOKING_NOTIFY_FROM`
- [ ] Sunucu fonksiyonlarının bölgesini veritabanına yakın seç
      (ör. Supabase İrlanda'daysa Vercel'de `dub1`).

## 5. Alan adı ve e-posta

- [ ] Alan adını bağla, HTTPS'in aktif olduğunu kontrol et.
- [ ] Resend'de alan adını doğrula (DNS kayıtları). Doğrulanana kadar bildirim
      yalnızca Resend hesabının e-posta adresine gider.
- [ ] Bir deneme randevusu oluştur ve bildirimin geldiğini gör.

## 6. KVKK

- [ ] `src/app/(site)/kvkk/page.tsx` bir **örnektir**, hukuki danışmanlık değildir.
      Yayından önce metni ve veri akışını (yurt dışına aktarım, saklama süresi,
      hizmet sağlayıcılar) mutlaka bir **avukata** kontrol ettir.
- [ ] `site.legalName` (veri sorumlusunun resmi unvanı) ve `site.kvkk` alanları
      gerçek bilgilerle doldurulmuş olmalı.
- [ ] Saklama süresi `0014_appointment_retention.sql` içinde (varsayılan 2 yıl).
      Avukatın önerisine göre güncelle.

## 7. Yayına çıkış

- [ ] `SITE_MODE=staging` ile deneme: sadece adı "TEST" ile başlayan randevular
      kabul edilir, site arama motorlarına kapalıdır.
- [ ] Her şey tamamsa `SITE_MODE`'u boşalt ya da `production` yap ve yeniden dağıt.
- [ ] Supabase, barındırma ve Resend hesaplarında **iki adımlı doğrulamayı (2FA)**
      aç.
- [ ] Deneme randevularını panelden iptal et ya da sil.

## 8. Google

- [ ] Salon için **Google İşletme Profili** aç ya da mevcut profile site adresini ekle
      (haritalarda çıkmanın asıl yolu bu).
- [ ] [Rich Results Test](https://search.google.com/test/rich-results) ile işletme
      kartının (JSON-LD) okunduğunu kontrol et.
- [ ] Google Search Console'a siteyi ekle ve `/sitemap.xml`'i gönder.
