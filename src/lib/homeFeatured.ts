/*
 * ANA SAYFA VİTRİNİ: hangi öncesi/sonrası örnekleri görünür?
 *
 * Kural: "Ana sayfada göster" işaretli (featured: true) olanlardan, gelen
 * sırayla İLK 3 tanesi. (Liste zaten sıra numarasına göre dizili geliyor.)
 *
 * Bu kural İKİ yerde kullanılıyor:
 *   - Ana sayfa (BeforeAfterTeaser) → gösterilecekleri seçmek için
 *   - Panel listesi → "Ana sayfada" / "Ana sayfa dolu" etiketini doğru koymak için
 * Tek fonksiyon olunca ikisi asla birbirinden farklı sonuç veremez.
 *
 * <T extends { featured: boolean }>: "featured alanı olan HER tür liste olur"
 *   → hem sitedeki BeforeAfterEntry'yi hem paneldeki AdminBeforeAfter'ı alabilir,
 *     ve geriye AYNI türde liste döner.
 *
 * İpucu: [1, 2, 3, 4].filter((n) => n > 1)  → [2, 3, 4]
 *        [2, 3, 4].slice(0, 2)              → [2, 3]
 *        HOME_FEATURED_LIMIT'i kullan, 3 yazma (sayı değişirse tek yerden değişsin).
 *
 * Saf fonksiyon → src/lib/homeFeatured.test.ts
 */
export const HOME_FEATURED_LIMIT = 3;

export function pickHomeFeatured<T extends { featured: boolean }>(entries: T[]): T[] {
  // İşaretlileri süz, ilk HOME_FEATURED_LIMIT tanesini al
  return entries.filter((e) => e.featured).slice(0, HOME_FEATURED_LIMIT);
}
