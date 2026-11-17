import { describe, expect, test } from "vitest";
import { addDays, isBookableDay, weekdayOf } from "./bookingDay";
import type { WorkingHoursRow } from "./hours";

const open: WorkingHoursRow = { weekday: 2, is_closed: false, open_time: "10:00:00", close_time: "19:00:00" };
const closed: WorkingHoursRow = { weekday: 0, is_closed: true, open_time: null, close_time: null };
const newYear = { startsOn: "2026-12-31", endsOn: "2027-01-01" };

// Bugün 17 Kasım 2026 (Salı). Varsayılan: açık gün, izin yok.
const check = (date: string, extra: Partial<Parameters<typeof isBookableDay>[0]> = {}) =>
  isBookableDay({ date, today: "2026-11-17", hours: open, blocked: [newYear], ...extra });

describe("yardımcılar", () => {
  test("addDays ay ve yıl geçişleri", () => {
    expect(addDays("2026-11-24", 7)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  test("weekdayOf", () => {
    expect(weekdayOf("2026-11-22")).toBe(0); // Pazar
    expect(weekdayOf("2026-11-24")).toBe(2); // Salı
  });
});

describe("isBookableDay", () => {
  test("sıradan bir açık gün → evet", () => {
    expect(check("2026-11-24")).toBe(true);
  });

  test("geçmiş gün → hayır, bugün → evet", () => {
    expect(check("2026-11-16")).toBe(false);
    expect(check("2026-11-17")).toBe(true); // geçmiş SAATLERİ getAvailableSlots eliyor
  });

  test("en fazla 59 gün sonrası (60. gün olmaz)", () => {
    expect(check(addDays("2026-11-17", 59))).toBe(true);
    expect(check(addDays("2026-11-17", 60))).toBe(false);
  });

  test("kapalı gün ya da çalışma saati satırı yok → hayır", () => {
    expect(check("2026-11-22", { hours: closed })).toBe(false);
    expect(check("2026-11-24", { hours: undefined })).toBe(false);
  });

  test("izin aralığının ilk ve son günü dahil, sonraki gün değil", () => {
    expect(check("2026-12-31")).toBe(false);
    expect(check("2027-01-01", { today: "2026-12-20" })).toBe(false);
    expect(check("2027-01-02", { today: "2026-12-20" })).toBe(true);
  });
});
