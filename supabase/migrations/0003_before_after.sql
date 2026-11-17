-- 0003: Öncesi / sonrası örnekleri
--
-- YABANCI ANAHTAR (foreign key): service_id, services tablosundaki bir id'yi gösterir.
--   * Tipi, gösterdiği kolonla AYNI olmalı (services.id bigint → service_id bigint).
--   * Veritabanı, var olmayan bir işleme bağlı örnek eklenmesine izin vermez.
--   * on delete restrict: Bağlı örneği olan bir işlem silinemez (önce örnekler
--     kaldırılmalı). Yanlışlıkla silmeye karşı emniyet kemeri; normalde işlem
--     silinmez, is_active = false ile pasif yapılır.

create table before_after (
  id bigint generated always as identity primary key,
  service_id bigint not null references services(id) on delete restrict,
  before_url text not null,
  after_url text not null,
  title text not null,
  description text not null,
  is_featured boolean not null default false,  -- ana sayfada gösterilsin mi?
  taken_on date not null,                      -- sadece tarih, saat yok
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Sayfalar "bu işlemin örnekleri" diye service_id ile arayacak → index hızlandırır.
-- (PostgreSQL yabancı anahtar kolonlarına otomatik index KOYMAZ.)
create index before_after_service_id_idx on before_after (service_id);

alter table before_after enable row level security;
grant select on before_after to anon, authenticated;

-- using (true): her satır için koşul hep doğru → herkes tüm örnekleri görebilir.
create policy "Herkes örnekleri görebilir"
  on before_after for select to anon, authenticated
  using (true);

-- Supabase varsayılan olarak tüm yetkileri veriyor; anon'un yazma yetkilerini geri alıyoruz.
revoke insert, update, delete, truncate, references, trigger on before_after from anon;
