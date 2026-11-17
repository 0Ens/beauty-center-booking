/*
 * TÜRKİYE SAATİ ÇEVİRİLERİ
 * Veritabanı zamanı UTC olarak verir: "2026-11-24T11:00:00+00:00"
 * slots.ts ise Türkiye saatine göre DAKİKA ister: 14:00 → 840
 * Bu dosya ikisi arasındaki köprü. Saat dilimi işi SADECE burada yapılır.
 *
 * Türkiye 2016'dan beri yıl boyu UTC+3 (yaz/kış saati yok).
 */
import { toMinutes, toTime } from "./slots";

const TIME_ZONE = "Europe/Istanbul";

// Intl.DateTimeFormat: tarayıcıda ve Node'da yerleşik, saat dilimi çevirisini bilir.
// "en-GB" → "14:00" biçimi; hourCycle "h23" → gece yarısı "24:00" değil "00:00" olsun.
const clock = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
// "en-CA" → "2026-11-24" biçimi (yıl-ay-gün)
const calendar = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });

/** Veritabanından gelen an → Türkiye saatinde dakika. "2026-11-24T11:00:00+00:00" → 840 */
export function minutesInIstanbul(iso: string): number {
  return toMinutes(clock.format(new Date(iso)));
}

/** Şu an Türkiye'de hangi gün ve saat? (Test edilebilsin diye "şu an" dışarıdan verilebilir) */
export function nowInIstanbul(now: Date = new Date()): { date: string; minutes: number } {
  return { date: calendar.format(now), minutes: toMinutes(clock.format(now)) };
}

/** Veritabanından gelen an → Türkiye'de hangi gün, kaçıncı dakika. "2026-11-24T11:00:00+00:00" → { date: "2026-11-24", minutes: 840 } */
export function inIstanbul(iso: string): { date: string; minutes: number } {
  return nowInIstanbul(new Date(iso));
}

/** Müşterinin seçtiği gün + dakika → veritabanına gidecek metin. ("2026-11-24", 795) → "2026-11-24T13:15:00+03:00" */
export function toIstanbulIso(date: string, minutes: number): string {
  // Saat olduğu gibi kalır; sondaki +03:00 "bu Türkiye saatidir" der.
  return `${date}T${toTime(minutes)}:00+03:00`;
}
