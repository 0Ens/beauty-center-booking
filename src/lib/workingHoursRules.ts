/*
 * BİR RANDEVU YENİ ÇALIŞMA SAATLERİNE SIĞIYOR MU?
 *
 * Salon sahibi saatleri değiştirince (ör. cumartesi kapanış 19:00 → 17:00), ileride
 * alınmış randevular yeni saatlerin dışında kalabilir. İzin günlerindeki
 * kuralın aynısı: dışarıda kalan randevu varsa değişiklik kaydedilmez,
 * salon sahibi önce o müşterilerle konuşur.
 *
 * Saf fonksiyon → src/lib/workingHoursRules.test.ts
 *
 * Saatler dakika cinsinden (10:00 → 600). Randevu aralığı [start, end):
 * başlangıç dahil, bitiş HARİÇ. 18:00–19:00 randevusu 19:00'da kapanan
 * salona sığar (slots.ts de aynı kuralla saat öneriyor).
 */
import type { Range } from "./slots";

/** Bir günün çalışma saati, dakika cinsinden */
export type DayHours = { closed: boolean; open: number; close: number };

// Kural proje sahibi tarafından yazıldı:
// gün açık olmalı, randevu açılışta ya da sonra başlamalı, kapanışta ya da önce bitmeli
export function fitsHours(appt: Range, day: DayHours): boolean {
  return !day.closed && appt.start >= day.open && appt.end <= day.close;
}
