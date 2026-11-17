-- 0007: Randevu oluşturma fonksiyonu
--
-- Ziyaretçiler (anon) appointments tablosuna doğrudan YAZAMAZ (0006).
-- Bunun yerine bu fonksiyonu çağırırlar. Fonksiyon her şeyi kendisi hesaplar
-- ve kontrol eder; tarayıcıdan sadece "hangi işlem, hangi saat, kim" gelir.
--
-- SECURITY DEFINER: fonksiyon onu çağıranın değil, YAZANIN yetkileriyle çalışır.
--   Banka gişesi gibi: müşteri kasaya giremez, gişe görevlisi kurallara uyarak
--   onun adına işlem yapar.
-- SET SEARCH_PATH = '': tablo adları hep tam adla (public.appointments) aranır;
--   biri aynı adlı sahte bir tablo oluşturup fonksiyonu kandıramaz.
--
-- HATALAR: her ret kısa bir kodla döner (ör. 'outside_working_hours').
--   Sitedeki kod (Server Action) bu kodları Türkçe mesajlara çevirecek.
--   Çakışan randevuyu ayrıca kontrol etmiyoruz: 0006'daki EXCLUDE kuralı
--   zaten reddeder (hata kodu 23P01), hem de aynı anda gelen isteklerde bile.

create function public.book_appointment(
  p_service_id bigint,
  p_starts_at timestamptz,
  p_customer_name text,
  p_phone text,
  p_note text,
  p_kvkk_consent boolean
) returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_duration    integer;
  v_ends_at     timestamptz;
  v_local_start timestamp;  -- Türkiye saatine çevrilmiş başlangıç (saat dilimsiz)
  v_local_end   timestamp;
  v_hours       public.working_hours;
  v_id          bigint;
begin
  -- 0) Zorunlu alanlar ve spam'e karşı uzunluk sınırları
  if p_service_id is null or p_starts_at is null then
    raise exception 'missing_field';
  end if;
  if p_kvkk_consent is not true then
    raise exception 'kvkk_required';
  end if;
  if length(trim(coalesce(p_customer_name, ''))) not between 2 and 100 then
    raise exception 'invalid_name';
  end if;
  -- Telefondaki boşluk, tire, parantez vb. atılınca 10–13 rakam kalmalı (05xx..., +90...)
  if length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) not between 10 and 13 then
    raise exception 'invalid_phone';
  end if;
  if length(coalesce(p_note, '')) > 500 then
    raise exception 'note_too_long';
  end if;

  -- 1) İşlem var ve aktif mi? → süresini al
  select duration_min into v_duration
  from public.services
  where id = p_service_id and is_active;

  if not found then
    raise exception 'service_not_found';
  end if;

  -- 2) Bitişi BİZ hesaplıyoruz (tarayıcıdan gelen bitişe güvenilmez)
  v_ends_at := p_starts_at + make_interval(mins => v_duration);

  -- 3) Geçmişe veya çok ileriye randevu olmaz
  if p_starts_at <= now() then
    raise exception 'in_past';
  end if;
  if p_starts_at > now() + interval '60 days' then
    raise exception 'too_far_ahead';
  end if;

  -- 4) Türkiye saatine çevir: sunucu UTC'de, working_hours ise Türkiye saatinde
  v_local_start := p_starts_at at time zone 'Europe/Istanbul';
  v_local_end   := v_ends_at   at time zone 'Europe/Istanbul';

  -- Başlangıç 15 dakikalık adımlarda olmalı (10:00, 10:15 ...; 10:07 olmaz)
  if extract(minute from v_local_start)::int % 15 <> 0
     or extract(second from v_local_start) <> 0 then
    raise exception 'invalid_start';
  end if;

  -- 5) O gün açık mı, işlem çalışma saatlerine sığıyor mu?
  select * into v_hours
  from public.working_hours
  where weekday = extract(dow from v_local_start);  -- dow: 0 = Pazar ... 6 = Cumartesi

  if not found
     or v_hours.is_closed
     or v_local_start::time < v_hours.open_time
     or v_local_end::time > v_hours.close_time
     or v_local_end::date <> v_local_start::date  -- gece yarısını geçiyorsa (23:30 + 60 dk → 00:30)
  then
    raise exception 'outside_working_hours';
  end if;

  -- 6) İzinli bir gün mü?
  if exists (
    select 1 from public.blocked_dates
    where v_local_start::date between starts_on and ends_on
  ) then
    raise exception 'blocked_date';
  end if;

  -- 7) Kaydet. Çakışma varsa EXCLUDE kuralı burada reddeder (23P01).
  insert into public.appointments
    (service_id, customer_name, phone, note, starts_at, ends_at, kvkk_consent)
  values
    (p_service_id, trim(p_customer_name), trim(p_phone), nullif(trim(p_note), ''),
     p_starts_at, v_ends_at, p_kvkk_consent)
  returning id into v_id;

  return v_id;
end;
$$;

-- Supabase yeni fonksiyonlara varsayılan olarak herkese çalıştırma izni verir.
-- Önce hepsini kapatıp sonra sadece gerekenleri açıyoruz (0005'teki revoke → grant gibi).
revoke execute on function public.book_appointment(bigint, timestamptz, text, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.book_appointment(bigint, timestamptz, text, text, text, boolean)
  to anon, authenticated;
