/*
 * ÇALIŞMA SAATLERİ → GOOGLE'IN ANLADIĞI BİÇİM (schema.org OpeningHoursSpecification)
 *
 * Google, işletme bilgisini sayfadaki yazılardan tahmin etmeye çalışmak yerine
 * JSON-LD denen yapısal veriyi okumayı tercih ediyor. Çalışma saatleri için
 * her AÇIK gün bir nesne:
 *
 *   { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "10:00", closes: "19:00" }
 *
 * Kapalı günler listeye HİÇ yazılmaz (schema.org'da "listede yoksa kapalı").
 *
 * Saf fonksiyon → src/lib/openingHours.test.ts
 */
import { hhmm, type WorkingHoursRow } from "./hours";

/** schema.org gün adları. Sıra veritabanındaki weekday ile AYNI: 0 = Pazar (Sunday) */
export const schemaDayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type OpeningHoursSpecification = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: (typeof schemaDayNames)[number];
  opens: string; // "10:00"
  closes: string; // "19:00"
};

export function toOpeningHoursSpecification(rows: WorkingHoursRow[]): OpeningHoursSpecification[] {
  // Kapalı günleri at (filter), kalan her satırı schema.org
  // biçimine çevir (map). hhmm → "10:00:00" yerine "10:00".
  return rows
    .filter((row) => !row.is_closed)
    .map((row) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: schemaDayNames[row.weekday],
      opens: hhmm(row.open_time),
      closes: hhmm(row.close_time),
    }));
}
