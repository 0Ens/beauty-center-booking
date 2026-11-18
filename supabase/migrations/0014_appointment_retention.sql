-- 0014: Eski randevulardaki kişisel verileri otomatik silme (KVKK saklama süresi)
--
-- KVKK: kişisel veri, işlenme amacı bitince silinmeli / anonim hale getirilmeli.
-- Karar: randevu tarihinden 2 YIL sonra ad, telefon ve not silinir.
-- İşlem, tarih ve durum KALIR (istatistik: "geçen yıl kaç kirpik lifting yaptık?").
-- Bunlar tek başına kimseyi tanımlamadığı için kişisel veri sayılmaz.
--
-- ÖN KOŞUL: Supabase Dashboard → Database → Extensions → "pg_cron" ara → etkinleştir.
-- (Aşağıdaki kontrol, etkin değilse anlaşılır bir hatayla durur.)

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise exception 'Önce Supabase Dashboard → Database → Extensions bölümünden pg_cron''u etkinleştirin, sonra bu dosyayı tekrar çalıştırın.';
  end if;
end $$;

-- Ne zaman anonimleştirildi? (null = henüz değil). Hem iz bırakır hem aynı
-- satırın her gece tekrar tekrar güncellenmesini önler.
alter table public.appointments add column anonymized_at timestamptz;

-- Onay kutusu artık "rıza" değil "aydınlatma metnini okudum" anlamında
-- (randevu verisi sözleşmenin kurulması/ifası gerekçesiyle işleniyor, KVKK 5/2-c).
-- Kolonun adını değiştirmiyoruz (randevu fonksiyonu bu adı kullanıyor), sadece açıklıyoruz.
comment on column public.appointments.kvkk_consent is
  'Müşteri KVKK aydınlatma metnini okuduğunu onayladı (açık rıza DEĞİL; hukuki sebep: KVKK 5/2-c)';

-- Kaç satırı anonimleştirdiğini döndürür (elle denerken görmek için)
create or replace function public.anonymize_old_appointments()
returns integer
language sql
set search_path = ''
as $$
  with done as (
    update public.appointments
    set customer_name = '(silindi)',
        phone = '',
        note = null,
        anonymized_at = now()
    where anonymized_at is null
      -- Randevu tarihi 2 yıldan eskiyse
      and starts_at < now() - interval '2 years'
    returning 1
  )
  select count(*)::integer from done;
$$;

-- Bu fonksiyonu siteden (anon) ya da giriş yapmış kullanıcı (authenticated)
-- ÇAĞIRAMASIN: sadece zamanlanmış görev (postgres) çalıştırır.
revoke execute on function public.anonymize_old_appointments() from public, anon, authenticated;

-- Her gece 03:15'te (UTC; Türkiye saatiyle 06:15) çalıştır.
-- Aynı isimle tekrar çalıştırılırsa cron.schedule eski görevi günceller.
select cron.schedule(
  'anonymize-old-appointments',
  '15 3 * * *',
  $$select public.anonymize_old_appointments()$$
);
