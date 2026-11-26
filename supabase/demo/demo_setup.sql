-- =====================================================================
-- SADECE DEMO PROJESİ İÇİN. Gerçek bir salonun veritabanında ÇALIŞTIRMA:
-- her gece TÜM randevuları siler.
--
-- Bu dosya bilerek migrations/ klasörünün DIŞINDA: yeni bir salon kurulurken
-- migration'lar sırayla çalıştırılır, bu dosya yanlışlıkla araya karışmasın.
--
-- Ön koşul: 0001–0015 migration'ları ve seed.sql çalıştırılmış, pg_cron
-- etkin olmalı (0014 zaten bunu istiyor).
--
-- Ne yapar?
--   1) Veritabanı seviyesinde kimlik ezme (trigger)
--   2) Her gece randevuları silme (pg_cron)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) KİMLİK EZME: kişisel veri veritabanına hiç ulaşmasın
-- ---------------------------------------------------------------------
-- Demo modunda site zaten adı/telefonu sunucuda uyduruyor (src/lib/demoIdentity.ts).
-- Ama book_appointment herkese açık bir fonksiyon: biri formu atlayıp
-- publishable key ile doğrudan çağırırsa sunucudaki o adım da atlanır.
-- Bu trigger, kayıt hangi yoldan gelirse gelsin ad/telefon/notu yazılmadan
-- hemen önce sahte değerlerle değiştirir. "Kişisel veri saklanmaz" sözü
-- böylece uygulamaya değil, veritabanının kendisine dayanır.
--
-- Sıra önemli: aynı olaydaki trigger'lar ADA GÖRE alfabetik çalışır.
-- "appointments_a_..." < "appointments_booking_limits" → önce kimlik ezilir,
-- sonra 0015'teki sınırlar sahte telefonla sayılır (site ile aynı davranış).

create function public.demo_replace_identity() returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_digits text := lpad(floor(random() * 10000)::int::text, 4, '0');
begin
  new.customer_name := 'Demo Misafir ' || v_digits;
  new.phone := '0500000' || v_digits;
  new.note := null;
  return new;
end;
$$;

revoke execute on function public.demo_replace_identity() from public, anon, authenticated;

create trigger appointments_a_demo_identity
  before insert on public.appointments
  for each row execute function public.demo_replace_identity();


-- ---------------------------------------------------------------------
-- 2) GECE TEMİZLİĞİ: demo her sabah boş takvimle başlasın
-- ---------------------------------------------------------------------
-- 00:00 UTC = Türkiye saatiyle 03:00.
-- Aynı isimle tekrar çalıştırılırsa cron.schedule eski görevi günceller.
select cron.schedule(
  'demo-nightly-reset',
  '0 0 * * *',
  $$delete from public.appointments$$
);

-- Kontrol (elle):
--   select * from cron.job;                                  -- görev listede mi?
--   select * from cron.job_run_details order by start_time desc limit 5;  -- çalıştı mı?
