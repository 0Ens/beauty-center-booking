/*
 * REZERVASYON İÇİN MÜSAİTLİK
 * Veritabanındaki parçaları toplar ve proje sahibinin yazdığı saf
 * fonksiyonlara verir:
 *   isBookableDay    → bu güne hiç randevu verilebilir mi?
 *   getAvailableSlots → o günün boş başlangıç saatleri
 *
 * ÖNBELLEK: Çalışma saatleri ve izin günleri saatlik önbellekten gelir (nadiren
 * değişir). Dolu saatler ise HER İSTEKTE taze okunur: az önce alınan bir
 * randevu hemen dolu görünmeli.
 *
 * connection(): "şu an"ı okumadan önce çağrılır. Böylece Next.js bu kodu
 * önceden (build sırasında) çalıştırıp donmuş bir saati herkese göstermez;
 * her ziyaretçi için o anki saatle çalışır.
 */
import { connection } from "next/server";
import { supabase } from "@/lib/supabase";
import { addDays, isBookableDay, MAX_DAYS_AHEAD, weekdayOf } from "@/lib/bookingDay";
import { minutesInIstanbul, nowInIstanbul } from "@/lib/istanbulTime";
import { getAvailableSlots, toMinutes } from "@/lib/slots";
import { getBlockedRanges } from "./blockedDates";
import { getWorkingHoursRows } from "./workingHours";

/** Bugünden en az bu kadar dakika sonrasına randevu alınabilir (salon sahibinin hazırlanma payı) */
const MIN_NOTICE_MINUTES = 60;

export type BookableDay = { date: string; bookable: boolean };

/** Takvim: bugünden itibaren MAX_DAYS_AHEAD gün, her biri seçilebilir mi? */
export async function getBookableDays(): Promise<BookableDay[]> {
  await connection();
  const { date: today } = nowInIstanbul();
  const [hoursRows, blocked] = await Promise.all([getWorkingHoursRows(), getBlockedRanges()]);

  return Array.from({ length: MAX_DAYS_AHEAD }, (_, i) => {
    const date = addDays(today, i);
    const hours = hoursRows.find((row) => row.weekday === weekdayOf(date));
    return { date, bookable: isBookableDay({ date, today, hours, blocked }) };
  });
}

/** Seçilen gün için boş başlangıç saatleri (dakika). Gün uygun değilse boş liste. */
export async function getDaySlots(durationMin: number, date: string): Promise<number[]> {
  await connection();
  const now = nowInIstanbul();
  const [hoursRows, blocked] = await Promise.all([getWorkingHoursRows(), getBlockedRanges()]);
  const hours = hoursRows.find((row) => row.weekday === weekdayOf(date));

  if (!isBookableDay({ date, today: now.date, hours, blocked })) return [];
  if (!hours?.open_time || !hours.close_time) return [];

  // Dolu aralıklar: sadece başlangıç ve bitiş (0008), UTC → Türkiye saatinde dakika
  const { data, error } = await supabase.rpc("get_busy_ranges", { p_day: date });
  if (error) throw new Error(`Dolu saatler yüklenemedi: ${error.message}`);

  const busy = (data as { starts_at: string; ends_at: string }[]).map((row) => ({
    start: minutesInIstanbul(row.starts_at),
    end: minutesInIstanbul(row.ends_at),
  }));

  return getAvailableSlots({
    open: toMinutes(hours.open_time), // "10:00:00" → 600
    close: toMinutes(hours.close_time),
    duration: durationMin,
    busy,
    earliest: date === now.date ? now.minutes + MIN_NOTICE_MINUTES : 0, // bugünse: şu an + 1 saat
  });
}
