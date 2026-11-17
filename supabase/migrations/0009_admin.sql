-- 0009: Yönetici (admin) yetkisi ve randevuları görme/onaylama
--
-- GİRİŞ YAPMAK ≠ YETKİLİ OLMAK
--   Supabase'de giriş yapan herkes "authenticated" rolünü alır. Kayıt olmayı
--   panelden kapatacağız ama yine de "giriş yaptıysa her şeyi görsün" demiyoruz.
--   Salon sahibinin hesabını ayrıca "admins" tablosuna yazıyoruz; randevuları sadece
--   bu tabloda olan kullanıcı görebilir. (İki kilit: biri açık kalsa diğeri tutar.)

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- RLS açık + politika yok → bu tabloyu API'den KİMSE okuyamaz/değiştiremez.
-- Sadece aşağıdaki is_admin() fonksiyonu (security definer) içine bakabilir.
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

-- "Şu an giriş yapmış kişi admin mi?"
--   auth.uid() → giriş yapmış kullanıcının id'si (giriş yoksa null).
--   (select auth.uid()) diye parantez içinde yazmak Supabase'in önerisi:
--   Postgres onu satır başına değil, sorgu başına BİR kez hesaplar.
--   security definer → admins tablosunu çağıranın değil, yazanın yetkisiyle okur.
create function public.is_admin() returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  -- admins tablosunda, user_id'si giriş yapmış kullanıcının id'sine eşit
  -- bir satır var mı? (proje sahibi yazdı)
  -- Giriş yoksa auth.uid() null → "user_id = null" hiçbir satırla eşleşmez → false.
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

-- Postgres fonksiyonları varsayılan olarak herkese (public) açıktır; daraltıyoruz.
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------
-- RANDEVULAR: admin görebilir ve SADECE durumunu değiştirebilir
-- ---------------------------------------------------------------------
-- Satırlar → RLS politikası (hangi satırlar?)
-- Kolonlar → yetki (grant) (hangi kolonlar?)
-- Admin'in yanlışlıkla müşteri adını, saati vs. değiştirmesini istemiyoruz;
-- panelde sadece "onayla / iptal et" var. Bu yüzden update yetkisi sadece status.

revoke all on public.appointments from authenticated;
grant select on public.appointments to authenticated;
grant update (status) on public.appointments to authenticated;

create policy "Admin randevuları görebilir"
  on public.appointments for select to authenticated
  using ((select public.is_admin()));

create policy "Admin randevu durumunu değiştirebilir"
  on public.appointments for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- NOT: İptal edilmiş bir randevuyu tekrar onaylarsan ve o saat bu arada
-- başkasına verildiyse, 0006'daki EXCLUDE kuralı bunu da reddeder (23P01).
-- Yani çift rezervasyon panelden de oluşamaz.
