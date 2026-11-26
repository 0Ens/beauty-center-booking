-- 0013: Öncesi / sonrası yönetimi (fotoğraf yükleme + KVKK onayı)
--
-- İKİ AYRI YER, İKİ AYRI KURAL:
--   1) Fotoğraf DOSYALARI → Supabase Storage, "before-after" kovası (bucket)
--   2) Fotoğrafın BİLGİLERİ (işlem, başlık, açıklama, dosya adresi) → before_after tablosu
-- İkisinin de yetkisi ayrı ayrı veriliyor: biri açık kalırsa diğeri kurtarmaz.

-- ---------------------------------------------------------------------
-- 1) KOVA (bucket)
-- ---------------------------------------------------------------------
--   public = true → dosyalar ".../object/public/before-after/<ad>.jpg" adresinden
--     HERKESE açık. Sitede göstereceğimiz için doğru olan bu. Ama "public"
--     sadece OKUMAYI açar: yükleme/silme yine aşağıdaki politikalara tabi.
--   file_size_limit → 2 MB. Tarayıcı fotoğrafı ~300-500 KB'a küçültüyor;
--     sınır, küçültmeyi atlayıp dev dosya göndermeye çalışana karşı.
--   allowed_mime_types → sadece JPEG. Tarayıcıda her fotoğrafı JPEG'e
--     çeviriyoruz (iPhone Safari canvas'tan WebP üretemiyor, JPEG her yerde var).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('before-after', 'before-after', true, 2097152, array['image/jpeg']);

-- Storage da aslında bir tablo: storage.objects (her dosya bir satır).
-- Yetkiler yine RLS politikasıyla veriliyor. bucket_id koşulu şart: yoksa
-- politika ileride açılacak BAŞKA kovaları da kapsardı.
--
-- Hangi işlem hangi politikayı ister? (Supabase belgeleri)
--   yükleme (upsert olmadan) → insert
--   silme (remove)           → select + delete  (göremediği dosyayı silemez)
create policy "Admin öncesi/sonrası fotoğrafı yükleyebilir"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'before-after' and (select public.is_admin()));

create policy "Admin öncesi/sonrası fotoğraflarını listeleyebilir"
  on storage.objects for select to authenticated
  using (bucket_id = 'before-after' and (select public.is_admin()));

create policy "Admin öncesi/sonrası fotoğrafı silebilir"
  on storage.objects for delete to authenticated
  using (bucket_id = 'before-after' and (select public.is_admin()));

-- ---------------------------------------------------------------------
-- 2) KVKK ONAYI
-- ---------------------------------------------------------------------
-- Yönetici fotoğraf eklerken "müşteriden yazılı açık rıza aldım" kutusunu
-- işaretliyor; bu kolon o beyanın kaydı. Rızanın KENDİSİ (imzalı form)
-- salonda saklanır; burası "işaretlendi mi, ne zaman (created_at)" kanıtı.
-- Mevcut satırlar çizim örnekleri (gerçek kişi yok) → false kalabilir.
alter table public.before_after
  add column consent_confirmed boolean not null default false;

-- ---------------------------------------------------------------------
-- 3) TABLO YETKİLERİ: satırlar (RLS) + kolonlar (GRANT)
-- ---------------------------------------------------------------------
-- Ekleme: sadece admin VE sadece onay kutusu işaretliyse.
--   Sunucu kodu da kontrol ediyor; ama kural veritabanında da durursa,
--   kodda bir hata olsa bile onaysız fotoğraf kaydedilemez.
create policy "Admin örnek ekleyebilir (KVKK onayıyla)"
  on public.before_after for insert to authenticated
  with check ((select public.is_admin()) and consent_confirmed = true);

create policy "Admin örnek düzenleyebilir"
  on public.before_after for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- İşlemlerin aksine örnekler SİLİNEBİLİR: bu tabloya bağlı başka tablo yok.
-- Müşteri rızasını geri çekerse fotoğraf tamamen kaldırılabilmeli (KVKK).
create policy "Admin örnek silebilir"
  on public.before_after for delete to authenticated
  using ((select public.is_admin()));

-- Supabase authenticated'a varsayılan olarak HER ŞEYİ veriyor → hepsini al,
-- gerekenleri tek tek ver (0012'deki gibi).
revoke all on public.before_after from authenticated;
grant select, delete on public.before_after to authenticated;

grant insert (service_id, before_url, after_url, title, description,
              is_featured, taken_on, sort_order, consent_confirmed)
  on public.before_after to authenticated;

-- Düzenlemede fotoğraflar ve onay DEĞİŞTİRİLEMEZ (kolon yetkisi yok).
-- Fotoğraf yanlışsa: örneği sil, yeniden ekle → yeni fotoğraf için yeni onay.
grant update (service_id, title, description, is_featured, taken_on, sort_order)
  on public.before_after to authenticated;
