/*
 * slots.ts TESTLERİ
 * Her test: "şu girdiyle çağırınca şu sonucu bekliyorum".
 * Çalıştırmak: npm test
 */
import { describe, expect, test } from "vitest";
import { getAvailableSlots, overlaps, toMinutes, toTime } from "./slots";

// Testleri okunaklı yazmak için: r("14:00", "15:30") → { start: 840, end: 930 }
const r = (start: string, end: string) => ({ start: toMinutes(start), end: toMinutes(end) });

// Sonuçları "13:15" gibi okunaklı karşılaştırmak için
const slotsAsText = (options: Parameters<typeof getAvailableSlots>[0]) => getAvailableSlots(options).map(toTime);

// Salon 10:00–19:00 açık
const day = { open: toMinutes("10:00"), close: toMinutes("19:00") };

describe("overlaps (iki aralık çakışıyor mu?)", () => {
  const ayse = r("14:00", "15:30");

  test("kısmen çakışan → evet", () => {
    expect(overlaps(r("13:15", "14:15"), ayse)).toBe(true);
    expect(overlaps(r("15:00", "16:00"), ayse)).toBe(true);
  });

  test("arka arkaya (biri bitince diğeri başlıyor) → hayır", () => {
    expect(overlaps(r("13:00", "14:00"), ayse)).toBe(false);
    expect(overlaps(r("15:30", "16:30"), ayse)).toBe(false);
  });

  test("tamamen ayrı → hayır", () => {
    expect(overlaps(r("10:00", "11:00"), ayse)).toBe(false);
  });

  test("biri diğerinin içinde → evet", () => {
    expect(overlaps(r("14:15", "14:45"), ayse)).toBe(true); // içinde
    expect(overlaps(r("13:00", "16:00"), ayse)).toBe(true); // tamamen kaplıyor
  });
});

describe("getAvailableSlots", () => {
  test("ilk saat açılış, son saat 60 dk'lık işlem için 18:00", () => {
    const slots = slotsAsText({ ...day, duration: 60 });
    expect(slots[0]).toBe("10:00");
    expect(slots.at(-1)).toBe("18:00");
    expect(slots).toHaveLength(33); // 10:00, 10:15 ... 18:00
  });

  test("90 dk'lık işlemde son saat 17:30", () => {
    expect(slotsAsText({ ...day, duration: 90 }).at(-1)).toBe("17:30");
  });

  test("14:00–15:30 randevusu varken 60 dk'lık işlem", () => {
    const slots = slotsAsText({ ...day, duration: 60, busy: [r("14:00", "15:30")] });
    expect(slots).toContain("13:00"); // 14:00'te biter → sığar
    expect(slots).not.toContain("13:15"); // 14:15'te biter → çakışır
    expect(slots).not.toContain("14:45"); // randevunun ortası
    expect(slots).not.toContain("15:15"); // 15:30'a kadar dolu
    expect(slots).toContain("15:30"); // randevu bitti
  });

  test("geçmiş saatler gösterilmez (bugün, saat 12:07)", () => {
    const slots = slotsAsText({ ...day, duration: 60, earliest: toMinutes("12:07") });
    expect(slots[0]).toBe("12:15");
  });

  test("gün tamamen doluysa boş saat yok", () => {
    expect(getAvailableSlots({ ...day, duration: 60, busy: [r("10:00", "19:00")] })).toEqual([]);
  });
});
