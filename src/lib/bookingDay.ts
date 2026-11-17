/*
 * BU GÜNE RANDEVU VERİLEBİLİR Mİ?
 * Bazı sebepler tek bir saati değil BÜTÜN GÜNÜ kapatır. O günlerde boş saat
 * hesaplamaya gerek yok; takvimde de o gün seçilemez görünecek.
 *
 * Tarihler "2026-11-24" biçiminde metin. Bu biçimin güzel bir özelliği var:
 * yıl-ay-gün sırasıyla yazıldığı için METİN olarak karşılaştırmak, TARİH
 * olarak karşılaştırmakla aynı sonucu verir: "2026-11-24" < "2026-12-01" → true
 *
 * Saf fonksiyonlar → src/lib/bookingDay.test.ts ile test ediliyor.
 */
import type { WorkingHoursRow } from "./hours";

/** En fazla kaç gün sonrasına randevu alınabilir (veritabanındaki book_appointment ile aynı) */
export const MAX_DAYS_AHEAD = 60;

/** İzin/tatil aralığı, iki uç da dahil */
export type BlockedRange = { startsOn: string; endsOn: string };

/** ("2026-11-24", 7) → "2026-12-01". Ay ve yıl geçişlerini Date halleder. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`); // öğlen UTC: hiçbir saat diliminde gün kaymaz
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "2026-11-24" → 2 (Salı). 0 = Pazar ... 6 = Cumartesi, working_hours ile aynı */
export function weekdayOf(date: string): number {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

type DayCheck = {
  date: string; // müşterinin seçtiği gün
  today: string; // Türkiye'de bugün
  hours: WorkingHoursRow | undefined; // o günün çalışma saati satırı
  blocked: BlockedRange[]; // bütün izin/tatil aralıkları
};

export function isBookableDay({ date, today, hours, blocked }: DayCheck): boolean {
  if (date < today) return false; // geçmiş bir gün (bugün olur; geçmiş SAATLERİ getAvailableSlots eler)
  if (date >= addDays(today, MAX_DAYS_AHEAD)) return false; // çok ileri (60. gün de olmaz)
  if (!hours || hours.is_closed) return false; // satır yok ya da kapalı
  if (blocked.some((b) => b.startsOn <= date && date <= b.endsOn)) return false; // izinli (iki uç dahil)
  return true;
}
