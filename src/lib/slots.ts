/*
 * BOŞ SAAT HESAPLAMA
 * Bir gün için müşteriye gösterilecek randevu başlangıç saatlerini bulur.
 *
 * Saatleri "gece yarısından bu yana geçen DAKİKA" olarak tutuyoruz:
 *   10:00 → 600, 13:15 → 795, 19:00 → 1140
 * Böylece saat hesabı basit toplama/karşılaştırmaya dönüşür, tarih ve saat
 * dilimi karmaşası bu fonksiyonun dışında kalır.
 *
 * Saf fonksiyon: veritabanı yok, Next.js yok → src/lib/slots.test.ts ile test ediliyor.
 */

/** Zaman aralığı, dakika cinsinden. Veritabanındaki tstzrange gibi: [start, end) → bitiş HARİÇ */
export type Range = { start: number; end: number };

/** "13:15" → 795 */
export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** 795 → "13:15" */
export function toTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** İki aralık çakışıyor mu? (Veritabanındaki && işlecinin aynısı) */
export function overlaps(a: Range, b: Range): boolean {
  // Çakışmamanın sadece iki yolu var; ikisi de değilse çakışıyorlar.
  // Bitiş HARİÇ olduğu için <= ve >=: 13:00–14:00 ile 14:00–15:30 çakışmaz.
  const endsBefore = a.end <= b.start; // a, b başlamadan bitiyor
  const startsAfter = a.start >= b.end; // a, b bittikten sonra başlıyor
  return !(endsBefore || startsAfter);
}

type SlotOptions = {
  open: number; // açılış (dakika)
  close: number; // kapanış (dakika)
  duration: number; // işlem süresi (dakika)
  step?: number; // başlangıç saatleri kaç dakikada bir (varsayılan 15)
  busy?: Range[]; // o günkü dolu aralıklar (iptal edilmemiş randevular)
  earliest?: number; // bundan önceki saatler gösterilmez (bugünse: şu an)
};

export function getAvailableSlots({ open, close, duration, step = 15, busy = [], earliest = 0 }: SlotOptions): number[] {
  const slots: number[] = [];

  // İşlem kapanıştan önce (ya da tam kapanışta) bitmeli
  for (let start = open; start + duration <= close; start += step) {
    const slot = { start, end: start + duration };

    if (start < earliest) continue; // geçmiş saat → atla
    if (busy.some((b) => overlaps(slot, b))) continue; // dolu bir aralıkla çakışıyor → atla

    slots.push(start);
  }

  return slots;
}
