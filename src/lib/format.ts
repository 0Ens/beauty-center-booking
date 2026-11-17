/** "2026-10-01" → "Ekim 2026" (gün gösterilmiyor) */
export function formatMonth(date: string) {
  // Saati öğlen veriyoruz: gece yarısı olsaydı saat dilimi farkı bir önceki güne/aya kaydırabilirdi
  return new Date(`${date}T12:00:00`).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}
