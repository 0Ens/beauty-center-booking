/** "2026-10" → "Ekim 2026" */
export function formatMonth(date: string) {
  return new Date(`${date}-01T12:00:00`).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}
