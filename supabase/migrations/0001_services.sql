-- =====================================================================
-- 0001: İŞLEMLER (services) TABLOSU
-- "Migration" = veritabanında yapılan bir değişikliğin dosyası.
-- Numaralı olmaları sırayla çalıştırılmaları içindir; bir kez çalışmış
-- bir migration DEĞİŞTİRİLMEZ, değişiklik gerekiyorsa yenisi (0002...) yazılır.
-- Böylece veritabanının geçmişi de git'te kodla birlikte tutulur.
-- =====================================================================

create table services (
  id            bigint generated always as identity primary key,
  slug          text not null unique,
  name          text not null,
  category      text not null,
  duration_min  integer not null check (duration_min > 0),
  summary       text not null,
  description   text not null,
  suitable_for  text[] not null default '{}',
  icon          text not null,
  featured      boolean not null default false,
  price_min     integer check (price_min >= 0),   -- boş olabilir: "fiyat için arayın"
  price_max     integer check (price_max >= price_min),
  is_active     boolean not null default true,    -- salon sahibi işlemi silmeden gizleyebilsin
  sort_order    integer not null default 0,       -- listedeki sıra
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- GÜVENLİK: iki katman
--
-- 1) GRANT (tablo düzeyi): "Bu rol bu tabloya hangi İŞLEMİ yapabilir?"
--    anon          = giriş yapmamış herkes (sitenin ziyaretçileri)
--    authenticated = giriş yapmış kullanıcı (yönetici)
--
-- 2) RLS POLICY (satır düzeyi): "İzin verilen işlemde HANGİ SATIRLARI görebilir?"
--
-- İkisi birlikte gerekir: GRANT kapıyı açar, POLICY içeride neyi
-- göreceğini süzer. Automatic RLS açık olsa da burada açıkça yazıyoruz;
-- dosyayı okuyan herkes tablonun korumalı olduğunu görsün.
-- ---------------------------------------------------------------------
alter table services enable row level security;

grant select on services to anon, authenticated;

-- Herkes sadece AKTİF işlemleri okuyabilir.
-- "using (...)" her satır için sorulan bir soru: true ise satır görünür.
create policy "Herkes aktif işlemleri görebilir"
  on services for select
  to anon, authenticated
  using (is_active = true);

-- Not: insert / update / delete için hiçbir policy yok →
-- RLS "izin verilmeyen her şey yasak" dediği için kimse değiştiremez.
-- Yöneticinin yazma izni sonraki migration'larda (0009+) eklenir.
