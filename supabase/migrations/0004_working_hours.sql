-- 0004: Çalışma saatleri (haftanın her günü için bir satır)
--
-- weekday PRIMARY KEY: Haftada 7 gün var, her gün için TEK satır olmalı.
--   Ayrı bir id'ye gerek yok; gün numarasının kendisi zaten benzersiz.
--   Aynı gün iki kez eklenmeye çalışılırsa veritabanı reddeder.
--   Numara düzeni JavaScript (getDay) ve PostgreSQL (extract(dow)) ile aynı:
--   0 = Pazar, 1 = Pazartesi ... 6 = Cumartesi.
--
-- Kapalı gün: satır VAR ama is_closed = true (satırın olmaması "unutuldu" ile karışırdı).

create table working_hours (
  weekday smallint primary key check (weekday between 0 and 6),
  is_closed boolean not null default false,
  open_time time,
  close_time time,
  -- Birden fazla kolonu birlikte kontrol eden kural:
  -- kapalıysa saatler önemsiz; açıksa iki saat de dolu ve açılış < kapanış olmalı.
  check (is_closed or (open_time is not null and close_time is not null and open_time < close_time))
);

alter table working_hours enable row level security;
grant select on working_hours to anon, authenticated;

-- Çalışma saatleri herkese açık bilgi (iletişim sayfası, rezervasyon takvimi)
create policy "Herkes çalışma saatlerini görebilir"
  on working_hours for select to anon, authenticated
  using (true);

revoke insert, update, delete, truncate, references, trigger on working_hours from anon;
