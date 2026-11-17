/*
 * ÇALIŞMA SAATLERİNİ EKRANA HAZIRLAMA
 * Veritabanında her gün için bir satır var (7 satır). Ekranda ise arka arkaya
 * gelen ve saatleri aynı olan günleri birleştiriyoruz:
 *   Pzt 10–19, Sal 10–19 ... Cmt 10–19, Paz Kapalı
 *   → "Pazartesi – Cumartesi: 10:00 – 19:00", "Pazar: Kapalı"
 *
 * Bu dosyada veritabanı ya da Next.js yok: sadece veri alıp veri döndüren
 * "saf" fonksiyonlar. Bu yüzden test yazması çok kolay (Aşama 4'te Vitest).
 */

/** Veritabanındaki satır (working_hours) */
export type WorkingHoursRow = {
  weekday: number; // 0 = Pazar, 1 = Pazartesi ... 6 = Cumartesi
  is_closed: boolean;
  open_time: string | null; // PostgreSQL time → "10:00:00"
  close_time: string | null;
};

/** Ekranda gösterilen satır */
export type HoursLine = { days: string; time: string };

type DayHours = { weekday: number; label: string };
type Group = { firstDay: number; lastDay: number; label: string };

const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

/** "10:00:00" → "10:00" */
function hhmm(time: string | null) {
  return (time ?? "").slice(0, 5);
}

/** Bir günün saatini tek bir yazıya çevirir → iki günü karşılaştırmak = iki yazıyı karşılaştırmak */
function toLabel(row: WorkingHoursRow): string {
  return row.is_closed ? "Kapalı" : `${hhmm(row.open_time)} – ${hhmm(row.close_time)}`;
}

/** Türkiye'de hafta pazartesi başlar: Pzt=0 ... Cmt=5, Paz=6 olacak şekilde sırala */
function mondayFirst(weekday: number) {
  return (weekday + 6) % 7;
}

/*
 * Birleştirme (proje sahibinin yazdığı mantık):
 * Günleri sırayla oku. Bugünün saati SON grubun saatiyle aynıysa grubu uzat,
 * değilse yeni grup başlat. Sadece son grupla karşılaştırdığımız için
 * "ardışık olma" şartı kendiliğinden sağlanır.
 */
export function groupHours(days: DayHours[]): Group[] {
  const groups: Group[] = [];

  for (const day of days) {
    const last = groups[groups.length - 1]; // son grup (ilk turda henüz yok → undefined)

    if (last && last.label === day.label) {
      last.lastDay = day.weekday; // grubu uzat
    } else {
      groups.push({ firstDay: day.weekday, lastDay: day.weekday, label: day.label }); // yeni grup başlat
    }
  }

  return groups;
}

/** Veritabanı satırlarından ekran satırlarına: sırala → yazıya çevir → birleştir → gün adlarını yaz */
export function toHoursLines(rows: WorkingHoursRow[]): HoursLine[] {
  const days = [...rows]
    .sort((a, b) => mondayFirst(a.weekday) - mondayFirst(b.weekday))
    .map((row) => ({ weekday: row.weekday, label: toLabel(row) }));

  return groupHours(days).map((group) => ({
    days:
      group.firstDay === group.lastDay
        ? dayNames[group.firstDay]
        : `${dayNames[group.firstDay]} – ${dayNames[group.lastDay]}`,
    time: group.label,
  }));
}
