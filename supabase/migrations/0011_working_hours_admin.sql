-- 0011: Çalışma saatlerini panelden düzenleme
--
-- Haftada 7 gün → tabloda hep 7 satır. Salon sahibi satır EKLEMEZ veya SİLMEZ,
-- sadece var olan satırların saatlerini değiştirir. Bu yüzden:
--   * sadece UPDATE yetkisi, o da sadece 3 kolon (weekday değiştirilemez:
--     "Pazartesi" satırı yanlışlıkla "Salı" olamaz)
--   * insert/delete yetkisi yok → 7 satır her zaman 7 kalır
--
-- Saatlerin mantıklı olması (açılış < kapanış) 0004'teki CHECK kuralıyla
-- veritabanında zaten garanti; panel de ayrıca kontrol edip Türkçe mesaj verir.

revoke all on public.working_hours from authenticated;
grant select on public.working_hours to authenticated;
grant update (is_closed, open_time, close_time) on public.working_hours to authenticated;

create policy "Admin çalışma saatlerini değiştirebilir"
  on public.working_hours for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
