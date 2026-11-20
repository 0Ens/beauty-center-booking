-- 0015: Randevu spam freni
--
-- SORUN: book_appointment (0007) herkese açık. Bir bot formu hiç kullanmadan
--   fonksiyonu doğrudan çağırıp 60 günlük bütün saatleri sahte kayıtlarla
--   doldurabilir. Formdaki bal küpü (honeypot) sadece formu kullanan botları durdurur.
--
-- ÇÖZÜM: appointments tablosuna TRIGGER. Her yeni satır yazılmadan HEMEN ÖNCE
--   (before insert) otomatik çalışır; kayıt hangi yoldan gelirse gelsin
--   bu kontrolden geçmek zorunda. book_appointment'ı değiştirmemiz gerekmedi.
--
-- Hata kodları book_appointment'takiler gibi message'da gelir (P0001);
--   src/lib/bookingErrors.ts bunları Türkçe mesaja çevirir.
--
-- NOT: Aynı anda gelen iki istek ikisi birden sınırı bir geçebilir (sayım
--   eşzamanlı yapılır). Bu bir fren, kesin sayaç değil; bu kadarı yeterli.

create function public.check_booking_limits() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- 1) GENEL FREN: son 1 saatte gelen talep sayısı
  --    Tek kişinin çalıştığı salona saatte 20 gerçek talep gelmez;
  --    gelirse bu bir saldırıdır. Gerçek müşteri "biraz sonra deneyin" görür.
  if (
    select count(*) from public.appointments
    where created_at > now() - interval '1 hour'
  ) >= 20 then
    raise exception 'too_many_requests';
  end if;

  -- 2) NUMARA BAŞINA SINIR
  --    Aynı telefon numarasının İLERİ TARİHTE, İPTAL EDİLMEMİŞ en fazla
  --    3 randevusu olabilir; 4.'sü reddedilir.
  --    - new.phone → trigger içinde, yazılmak üzere olan yeni satır "new"
  --    - İki tarafı da rakama indiriyoruz: "0532 123 45 67" = "05321234567"
  --      (aşağıdaki index de tam bu ifadeyi indeksliyor → sayım hızlı)
  --    - Geçmiş randevular sayılmaz: düzenli müşteri yıllarca gelebilir
  --    - İptaller sayılmaz: salon sahibi iptal ettiyse müşteri yeniden alabilmeli
  if (
    select count(*) from public.appointments
    where regexp_replace(phone, '\D', '', 'g') = regexp_replace(new.phone, '\D', '', 'g')
      and starts_at > now()
      and status <> 'cancelled'
  ) >= 3 then
    raise exception 'too_many_for_phone';
  end if;

  return new;  -- before trigger: "new" dönerse satır yazılır
end;
$$;

-- Trigger'ı tabloya bağla: her yeni satırdan önce, satır başına bir kez
create trigger appointments_booking_limits
  before insert on public.appointments
  for each row execute function public.check_booking_limits();

-- Bu fonksiyon sadece trigger olarak çalışmalı; kimse API'den doğrudan çağırmasın
revoke execute on function public.check_booking_limits() from public, anon, authenticated;

-- Telefona göre saymayı hızlandıran index. Rakama indirilmiş halini indeksliyoruz
-- (karşılaştırmayı da o halde yapacağımız için). Sadece aktif randevular:
-- iptaller zaten sayılmıyor, index'te yer kaplamasın.
create index appointments_phone_digits_active
  on public.appointments (regexp_replace(phone, '\D', '', 'g'))
  where status <> 'cancelled';
