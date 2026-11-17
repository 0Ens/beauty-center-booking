-- =====================================================================
-- 0002: ZİYARETÇİNİN (anon) YAZMA YETKİLERİNİ GERİ AL
--
-- 0001'deki "grant select" satırı sanıldığı gibi kısıtlama yapmadı:
-- Supabase, public şemasındaki her yeni tabloya anon ve authenticated
-- rollerine varsayılan olarak TÜM yetkileri veriyor. Test bunu gösterdi:
-- ekleme denemesi "permission denied" ile değil, RLS ihlali ile reddedildi.
--
-- Veri RLS sayesinde zaten güvendeydi; bu dosya İKİNCİ KİLİT
-- (defense in depth): RLS bir gün yanlışlıkla kapatılsa bile ziyaretçi
-- yine yazamasın.
--
-- authenticated'a dokunmuyoruz: Aşama 5'te salon sahibi (giriş yapmış kullanıcı)
-- bu tabloyu düzenleyecek. Onun yetkilerini RLS policy'leriyle sınırlayacağız.
-- =====================================================================

revoke insert, update, delete on services from anon;

-- TRUNCATE = tablonun TAMAMINI tek komutla boşaltır. RLS policy'leri
-- truncate'e UYGULANMAZ, bu yüzden açıkça kapatıyoruz.
-- (references/trigger: ziyaretçinin hiç ihtiyacı olmayan diğer yetkiler.)
revoke truncate, references, trigger on services from anon;
