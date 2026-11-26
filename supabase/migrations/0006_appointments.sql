-- 0006: Randevular
--
-- ÇİFT REZERVASYON PROBLEMİ (race condition):
--   "Önce boş mu diye bak, sonra kaydet" uygulamada yapılırsa, aynı anda gelen
--   iki istek ikisi de "boş" görür ve ikisi de kaydeder. Çözüm: kontrolü
--   VERİTABANINA vermek. Veritabanı kayıtları tek tek işler; ikincisini reddeder.
--
-- unique(starts_at) YETMEZ: 14:00–15:30 ve 14:30–15:30 farklı saatte başlar ama çakışır.
--
-- EXCLUDE: "şu koşulu sağlayan iki satır olamaz".
--   tstzrange(starts_at, ends_at) → [başlangıç, bitiş) aralığı
--     [ = başlangıç dahil, ) = bitiş HARİÇ → 14:00–15:00 ile 15:00–16:00 çakışmaz
--   &&  → "çakışıyor mu?" işleci
--   where (status <> 'cancelled') → iptal edilen randevular saati meşgul etmez
--   using gist → aralıkları hızlı aramak için özel index türü

create table appointments (
  id bigint generated always as identity primary key,
  service_id bigint not null references services(id) on delete restrict,
  customer_name text not null check (length(trim(customer_name)) > 0),
  phone text not null,
  note text,
  starts_at timestamptz not null,   -- timestamptz: tarih + saat + saat dilimi (Türkiye: +03)
  ends_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),  -- beklemede / onaylandı / iptal
  kvkk_consent boolean not null check (kvkk_consent),           -- onay vermeden randevu olmaz
  created_at timestamptz not null default now(),

  check (starts_at < ends_at),
  constraint appointments_no_overlap
    exclude using gist (tstzrange(starts_at, ends_at) with &&)
    where (status <> 'cancelled')
);

-- RLS açık ve HİÇ politika yok → "izin verilmeyen her şey yasaktır": kimse okuyamaz/yazamaz.
-- Müşteri adı ve telefonu KİŞİSEL VERİDİR (KVKK); ziyaretçiler asla okuyamamalı.
-- Randevu oluşturma bir veritabanı fonksiyonu üzerinden olur (0007_book_appointment;
-- bitiş saati, çalışma saatleri ve izin günleri orada kontrol edilir).
-- Yöneticinin (admin) erişimi 0009'da eklenir.
alter table appointments enable row level security;

revoke all on appointments from anon;
