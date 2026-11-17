// Rezervasyon tarihleri: öğlen UTC + timeZone "UTC" → hangi ülkeden bakılırsa bakılsın gün kaymaz
function utcNoon(date: string) {
  return new Date(`${date}T12:00:00Z`);
}

/** "2026-11-24" → "24 Kasım 2026 Salı" */
export function formatDayLong(date: string) {
  return utcNoon(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
    timeZone: "UTC",
  });
}

/** "2026-12-01" → "Ara" (takvimde ayın ilk gününün üstünde) */
export function formatMonthShort(date: string) {
  return utcNoon(date).toLocaleDateString("tr-TR", { month: "short", timeZone: "UTC" });
}

/** "2026-10-01" → "Ekim 2026" (gün gösterilmiyor) */
export function formatMonth(date: string) {
  // Saati öğlen veriyoruz: gece yarısı olsaydı saat dilimi farkı bir önceki güne/aya kaydırabilirdi
  return new Date(`${date}T12:00:00`).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}
