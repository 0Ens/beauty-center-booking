-- =====================================================================
-- SADECE DEMO PROJESİ İÇİN. demo_setup.sql'den SONRA çalıştır.
--
-- Ziyaretçilerin (ör. işe alım uzmanları) giriş sayfasındaki "Demo olarak gir"
-- düğmesiyle şifre yazmadan girdiği ORTAK bir demo yönetici hesabı.
--
-- Bu hesap herkese açık olduğu için asıl kilit VERİTABANINDA:
-- tarayıcıdaki oturum anahtarını (çerez) kopyalayan biri sitemizi atlayıp
-- Supabase'e doğrudan istek atabilir. O zaman sunucudaki "Demoda kapalı"
-- kontrolü devre dışı kalır; ama aşağıdaki RLS politikaları kalmaz.
--
-- Ne yapar?
--   1) demo_accounts tablosu + is_demo_account() fonksiyonu
--   2) Demo hesabı işlem, çalışma saati, izin günü, galeri ve fotoğraf
--      deposuna YAZAMAZ (okuyabilir). Randevu onaylama/iptal etme açık.
--   3) Demo hesabının şifresi, e-postası, telefonu değiştirilemez.
--   4) Gece temizliği: randevuları sil + önümüzdeki günlere örnek randevu koy.
--
-- Hesabı oluşturma (Supabase paneli):
--   Authentication → Users → Add user → Create new user
--   (e-posta + güçlü şifre, "Auto Confirm User" işaretli), sonra:
--     insert into public.admins (user_id)        select id from auth.users where email = 'DEMO_EPOSTASI';
--     insert into public.demo_accounts (user_id) select id from auth.users where email = 'DEMO_EPOSTASI';
--   E-posta ve şifre sunucunun ortam değişkenlerine yazılır
--   (DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD), sitede hiçbir yerde görünmez.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) HANGİ HESAP DEMO HESABI?
-- ---------------------------------------------------------------------
-- admins (0009) ile aynı desen: RLS açık + politika yok → API'den kimse
-- okuyamaz/değiştiremez; sadece security definer fonksiyon içine bakar.
create table public.demo_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.demo_accounts enable row level security;
revoke all on public.demo_accounts from anon, authenticated;

create function public.is_demo_account() returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.demo_accounts where user_id = (select auth.uid())
  );
$$;

-- Politikalar bu fonksiyonu GİRİŞ YAPAN KULLANICININ yetkisiyle çağırır,
-- bu yüzden authenticated çalıştırabilmeli.
revoke execute on function public.is_demo_account() from public, anon;
grant execute on function public.is_demo_account() to authenticated;


-- ---------------------------------------------------------------------
-- 2) YAZMA KİLİDİ: RESTRICTIVE politikalar
-- ---------------------------------------------------------------------
-- Şimdiye kadarki politikaların hepsi PERMISSIVE (varsayılan): aynı işlem için
-- birden fazla varsa "VEYA" ile birleşir, biri izin verirse yeter.
-- RESTRICTIVE politika ise "VE" ile eklenir: permissive'ler izin verse bile
-- restrictive de izin vermek ZORUNDA. Yani mevcut "Admin ... ekleyebilir"
-- politikalarına dokunmadan üstüne bir şart koyuyoruz:
--   izin = (admin mi?) VE (demo hesabı DEĞİL mi?)
--
-- Sadece insert/update/delete için. SELECT'e koymuyoruz: demo hesabı
-- panelde her şeyi GÖREBİLSİN istiyoruz.
-- Aynı üç politikayı dört tabloya tek tek yazmak yerine döngüyle üretiyoruz
-- (format('%I') tablo adını güvenle tırnaklar).
do $$
declare
  t text;
begin
  foreach t in array array['services', 'working_hours', 'blocked_dates', 'before_after'] loop
    execute format(
      'create policy "Demo hesabı ekleyemez" on public.%I as restrictive
         for insert to authenticated with check (not (select public.is_demo_account()))', t);
    execute format(
      'create policy "Demo hesabı değiştiremez" on public.%I as restrictive
         for update to authenticated using (not (select public.is_demo_account()))', t);
    execute format(
      'create policy "Demo hesabı silemez" on public.%I as restrictive
         for delete to authenticated using (not (select public.is_demo_account()))', t);
  end loop;
end
$$;

-- Fotoğraf deposu (0013): demo hesabı hiçbir kovaya dosya yükleyemez/silemez.
create policy "Demo hesabı dosya yükleyemez" on storage.objects as restrictive
  for insert to authenticated with check (not (select public.is_demo_account()));
create policy "Demo hesabı dosya değiştiremez" on storage.objects as restrictive
  for update to authenticated using (not (select public.is_demo_account()));
create policy "Demo hesabı dosya silemez" on storage.objects as restrictive
  for delete to authenticated using (not (select public.is_demo_account()));

-- appointments'a kilit YOK: onayla/iptal et demoda gerçekten çalışsın.
-- (0009 zaten sadece status kolonunun değişmesine izin veriyor; en kötü
-- ihtimalle biri bütün randevuları iptal eder, gece temizliği düzeltir.)


-- ---------------------------------------------------------------------
-- 3) HESAP ELE GEÇİRİLEMESİN
-- ---------------------------------------------------------------------
-- Oturum anahtarı olan biri Supabase Auth'a "şifremi değiştir" diyebilir;
-- o zaman demo düğmesi herkes için bozulurdu. Bu trigger, demo hesabının
-- satırı güncellenirken şifre/e-posta/telefonu ESKİ değerinde tutar.
-- (Girişte "son giriş zamanı" gibi diğer alanlar normal güncellenir.)
--
-- security definer: auth.users'ı Supabase'in kendi auth rolü günceller;
-- o rolün public.demo_accounts'u okuma yetkisi yok, fonksiyon sahibininki var.
--
-- Şifreyi SEN değiştirmek istersen: önce demo_accounts'tan satırı sil,
-- şifreyi değiştir, sonra satırı yeniden ekle.
create function public.demo_lock_credentials() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.demo_accounts where user_id = old.id) then
    new.encrypted_password := old.encrypted_password;
    new.email := old.email;
    new.phone := old.phone;
  end if;
  return new;
end;
$$;

revoke execute on function public.demo_lock_credentials() from public, anon, authenticated;

create trigger demo_lock_credentials
  before update on auth.users
  for each row execute function public.demo_lock_credentials();


-- ---------------------------------------------------------------------
-- 4) GECE TEMİZLİĞİ + ÖRNEK RANDEVULAR
-- ---------------------------------------------------------------------
-- Panele giren biri boş bir liste görmesin: her gece randevular silinir ve
-- bugünden itibaren 7 güne birkaç örnek randevu konur (bekleyen, onaylı, iptal).
-- Çalışma saatleri ve izin günleri dikkate alınır; saatler arası boşluk
-- en uzun işlemden fazla olduğu için çakışma olmaz.
--
-- Satırlar normal yoldan eklenir, yani trigger'lardan geçer:
--   - appointments_a_demo_identity (demo_setup.sql) → "Demo Misafir 1234" + sahte telefon
--   - appointments_booking_limits (0015) → saatlik sınır created_at'e bakar;
--     created_at'i geçmişe yazıyoruz ki örnekler ziyaretçilerin hakkını yemesin.
--
-- Hepsi tek işlem (transaction): bir yerde hata olursa silme de geri alınır.
create function public.demo_nightly_reset() returns void
language plpgsql
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Europe/Istanbul')::date;
  v_day date;
  v_hours public.working_hours;
  v_service_ids bigint[];
  v_durations integer[];
  v_slot time;
  v_start timestamptz;
  v_minutes integer;
  v_status text;
  v_n integer := 0;
  k integer;
begin
  delete from public.appointments;

  select array_agg(id order by sort_order, id), array_agg(duration_min order by sort_order, id)
    into v_service_ids, v_durations
    from public.services
    where is_active;
  if v_service_ids is null then
    return;  -- aktif işlem yoksa örnek de yok
  end if;

  for i in 0..6 loop
    v_day := v_today + i;

    select * into v_hours from public.working_hours where weekday = extract(dow from v_day);
    continue when not found or v_hours.is_closed;
    continue when exists (
      select 1 from public.blocked_dates where v_day between starts_on and ends_on
    );

    foreach v_slot in array array['10:30', '13:00', '16:00']::time[] loop
      v_n := v_n + 1;
      continue when v_n % 4 = 0;  -- her saat dolu olmasın, takvim doğal görünsün

      k := 1 + (v_n % array_length(v_service_ids, 1));
      v_minutes := v_durations[k];
      continue when v_slot < v_hours.open_time
                 or v_slot + make_interval(mins => v_minutes) > v_hours.close_time;

      v_start := (v_day + v_slot) at time zone 'Europe/Istanbul';
      continue when v_start <= now();  -- elle gün içinde çalıştırılırsa geçmiş saatleri atla

      v_status := case
        when v_n % 7 = 0 then 'cancelled'
        when v_n % 3 = 0 then 'pending'
        when i >= 3 and v_n % 2 = 0 then 'pending'
        else 'confirmed'
      end;

      insert into public.appointments
        (service_id, customer_name, phone, starts_at, ends_at, status, kvkk_consent, created_at)
      values
        (v_service_ids[k], 'Demo Misafir', '05000000000', v_start,
         v_start + make_interval(mins => v_minutes), v_status, true, now() - interval '1 day');
    end loop;
  end loop;
end;
$$;

-- ÇOK ÖNEMLİ: public şemasındaki fonksiyonlar API'den çağrılabilir.
-- Bunu herkes çalıştırabilseydi tek istekle bütün randevuları silerdi.
revoke execute on function public.demo_nightly_reset() from public, anon, authenticated;

-- demo_setup.sql'deki görevi günceller (aynı isim → cron.schedule üzerine yazar)
select cron.schedule(
  'demo-nightly-reset',
  '0 0 * * *',
  $$select public.demo_nightly_reset()$$
);

-- Örnekleri hemen bir kez oluştur (gece beklemeden)
select public.demo_nightly_reset();

-- Kontrol (elle):
--   select id, customer_name, starts_at, status from public.appointments order by starts_at;
--   select jobname, schedule, command from cron.job;
