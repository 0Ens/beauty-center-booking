-- 0012: İşlemleri panelden yönetme
--
-- Ziyaretçi sadece AKTİF işlemleri görür (0001'deki kural aynen kalıyor).
-- Admin pasif işlemleri de görür: yoksa pasife aldığı işlemi geri açamaz.
--
-- SİLME YOK: eski randevular ve öncesi/sonrası örnekleri işleme bağlı
-- (on delete restrict). Silmek ya hata verir ya da geçmişi bozar; onun yerine
-- is_active = false ile "pasife alma" var.
--
-- SLUG DEĞİŞTİRİLEMEZ: slug, işlemin adresidir (/islemlerimiz/kas-tasarimi).
-- Değişirse Google'daki ve Instagram'da paylaşılmış linkler 404 verir.
-- Bu yüzden slug'a sadece INSERT yetkisi var, UPDATE yetkisi yok.
-- (Kural uygulamada da var ama asıl kilit burada: veritabanı izin vermez.)

-- ---------------------------------------------------------------------
-- 1) Okuma politikalarını ikiye ayır
-- ---------------------------------------------------------------------
drop policy "Herkes aktif işlemleri görebilir" on public.services;

create policy "Ziyaretçi aktif işlemleri görebilir"
  on public.services for select to anon
  using (is_active = true);

-- Giriş yapmış kullanıcı da aktifleri görür; admin ise hepsini.
create policy "Admin tüm işlemleri görebilir"
  on public.services for select to authenticated
  using (is_active = true or (select public.is_admin()));

-- ---------------------------------------------------------------------
-- 2) Ekleme ve düzenleme sadece admin
-- ---------------------------------------------------------------------
create policy "Admin işlem ekleyebilir"
  on public.services for insert to authenticated
  with check ((select public.is_admin()));

create policy "Admin işlem düzenleyebilir"
  on public.services for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- 3) Kolon yetkileri
--    id ve created_at veritabanı tarafından doldurulur, elle yazılamaz.
--    slug sadece eklerken yazılır. DELETE yetkisi hiç yok.
-- ---------------------------------------------------------------------
revoke all on public.services from authenticated;
grant select on public.services to authenticated;

grant insert (slug, name, category, duration_min, summary, description, suitable_for,
              icon, featured, price_min, price_max, is_active, sort_order)
  on public.services to authenticated;

grant update (name, category, duration_min, summary, description, suitable_for,
              icon, featured, price_min, price_max, is_active, sort_order)
  on public.services to authenticated;
