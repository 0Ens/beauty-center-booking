-- 0005: İzin / tatil günleri (salonun kapalı olduğu tarih aralıkları)
--
-- Tek satır = bir aralık (başlangıç – bitiş). Bir günlük izinde ikisi aynı gün.
--
-- GİZLİLİK: Ziyaretçi sadece TARİHLERİ görmeli (takvimde o günler kapalı
-- görünsün). İznin SEBEBİ özel olabilir → ziyaretçiye gösterilmez.
--   * RLS satırları süzer, kolonları SÜZEMEZ.
--   * Kolon gizlemek için YETKİLER kullanılır: grant select (kolon1, kolon2 ...).
--   * Supabase anon'a varsayılan olarak TÜM yetkileri verdiği için önce hepsini
--     geri alıyoruz, sonra sadece izin verilen kolonları veriyoruz.
--   * Sonuç: anon "select *" yaparsa HATA alır (reason'a yetkisi yok);
--     kolonları tek tek yazmak zorunda: select id, starts_on, ends_on.

create table blocked_dates (
  id bigint generated always as identity primary key,
  starts_on date not null,
  ends_on date not null,
  reason text,                    -- isteğe bağlı; sadece yönetici görür
  created_at timestamptz not null default now(),
  check (starts_on <= ends_on)    -- <= : bir günlük izinde başlangıç = bitiş
);

alter table blocked_dates enable row level security;

create policy "Herkes izin günlerini görebilir"
  on blocked_dates for select to anon, authenticated
  using (true);

revoke all on blocked_dates from anon;
grant select (id, starts_on, ends_on) on blocked_dates to anon;
