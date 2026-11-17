-- 0008: Bir günün DOLU aralıkları (rezervasyon sayfası için)
--
-- Rezervasyon sayfası boş saatleri hesaplamak için o günün dolu aralıklarını
-- bilmeli; ama ziyaretçiler appointments tablosunu okuyamaz (KVKK).
-- Bu fonksiyon tabloyu kendisi okur ve dışarıya SADECE başlangıç ve bitişi verir.
--
-- VERİ MİNİMİZASYONU: Anahtar herkese açık olduğu için bu fonksiyonu herkes
-- tarayıcı konsolundan çağırabilir. Ad, telefon, not, hatta hangi işlem
-- yaptırıldığı (service_id) dışarı çıkmaz; boş saat hesabı için gerekmiyor.
--
-- stable: fonksiyon veritabanını değiştirmez, sadece okur (Postgres buna göre optimize eder).

create function public.get_busy_ranges(p_day date)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select a.starts_at, a.ends_at
  from public.appointments a
  where a.status <> 'cancelled'                                       -- iptal edilen saat tekrar boş
    and (a.starts_at at time zone 'Europe/Istanbul')::date = p_day     -- Türkiye saatine göre o gün
  order by a.starts_at;
$$;

revoke execute on function public.get_busy_ranges(date) from public, anon, authenticated;
grant execute on function public.get_busy_ranges(date) to anon, authenticated;
