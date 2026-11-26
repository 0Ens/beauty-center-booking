-- 0010: İzin günlerini panelden yönetme + "authenticated" yetkilerini daraltma
--
-- SORUN 1: blocked_dates için 0005'te sadece anon'u daralttık.
--   Supabase, giriş yapmış herkese (authenticated) varsayılan olarak TÜM
--   yetkileri veriyor. Ayrıca "Herkes izin günlerini görebilir" politikası
--   authenticated'ı da kapsıyordu → giriş yapan herkes izin SEBEBİNİ okuyabilirdi.
--
-- SORUN 2: TRUNCATE (tabloyu tek komutla boşaltma) RLS'e TAKILMAZ.
--   RLS satır satır kontrol eder; truncate ise satırlara bakmadan tabloyu siler.
--   Yani politikalar ne derse desin, truncate yetkisi olan herkes tabloyu
--   boşaltabilir. services / before_after / working_hours tablolarında bu yetkiyi
--   anon'dan almıştık ama authenticated'da hâlâ duruyordu.
--
-- Kayıt olma kapalı ve tek hesap yöneticide olduğu için bugün kimse bunu kullanamaz.
-- Ama güvenlik "bugün kimse yok" varsayımına dayanmamalı (iki kilit kuralı).

-- ---------------------------------------------------------------------
-- 1) Tüm tablolarda authenticated'dan tehlikeli yetkileri al
-- ---------------------------------------------------------------------
revoke truncate, references, trigger
  on public.services, public.before_after, public.working_hours
  from authenticated;

-- ---------------------------------------------------------------------
-- 2) blocked_dates: ziyaretçi tarihleri görür, admin her şeyi yönetir
-- ---------------------------------------------------------------------
-- Eski politika anon VE authenticated içindi; ikiye ayırıyoruz.
drop policy "Herkes izin günlerini görebilir" on public.blocked_dates;

create policy "Ziyaretçi izin günlerini görebilir"
  on public.blocked_dates for select to anon
  using (true);

create policy "Admin izin günlerini görebilir"
  on public.blocked_dates for select to authenticated
  using ((select public.is_admin()));

create policy "Admin izin günü ekleyebilir"
  on public.blocked_dates for insert to authenticated
  with check ((select public.is_admin()));

create policy "Admin izin günü silebilir"
  on public.blocked_dates for delete to authenticated
  using ((select public.is_admin()));

-- Kolon yetkileri: admin okuyabilir, ekleyebilir (id ve created_at veritabanı
-- tarafından doldurulur, elle yazılamaz), silebilir. Düzenleme (update) yok:
-- yanlış girilen izin silinip yeniden eklenir; panel daha basit kalır.
revoke all on public.blocked_dates from authenticated;
grant select on public.blocked_dates to authenticated;
grant insert (starts_on, ends_on, reason) on public.blocked_dates to authenticated;
grant delete on public.blocked_dates to authenticated;
