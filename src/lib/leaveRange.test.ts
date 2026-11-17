import { describe, expect, test } from "vitest";
import { leaveRangeError, MAX_LEAVE_DAYS } from "./leaveRange";

const today = "2026-11-17";

describe("leaveRangeError", () => {
  test("geçerli aralık → null", () => {
    expect(leaveRangeError({ startsOn: "2026-12-01", endsOn: "2026-12-03", today })).toBeNull();
  });

  test("tek günlük izin (başlangıç = bitiş) geçerli", () => {
    expect(leaveRangeError({ startsOn: "2026-12-01", endsOn: "2026-12-01", today })).toBeNull();
  });

  test("bugün başlayan izin geçerli", () => {
    expect(leaveRangeError({ startsOn: today, endsOn: today, today })).toBeNull();
  });

  test("bitiş başlangıçtan önce → hata", () => {
    expect(leaveRangeError({ startsOn: "2026-12-03", endsOn: "2026-12-01", today })).toBe(
      "Bitiş tarihi başlangıç tarihinden önce olamaz.",
    );
  });

  test("geçmişte başlayan izin → hata", () => {
    expect(leaveRangeError({ startsOn: "2026-11-16", endsOn: "2026-11-20", today })).toBe(
      "Geçmiş bir tarihe izin eklenemez.",
    );
  });

  test("ay ve yıl geçişi: 30 Aralık – 2 Ocak geçerli", () => {
    expect(leaveRangeError({ startsOn: "2026-12-30", endsOn: "2027-01-02", today })).toBeNull();
  });

  test(`tam ${MAX_LEAVE_DAYS} gün geçerli (iki uç dahil)`, () => {
    // 1 Aralık + 59 gün = 29 Ocak → 1 Aralık..29 Ocak = 60 gün
    expect(leaveRangeError({ startsOn: "2026-12-01", endsOn: "2027-01-29", today })).toBeNull();
  });

  test(`${MAX_LEAVE_DAYS + 1} gün → hata`, () => {
    expect(leaveRangeError({ startsOn: "2026-12-01", endsOn: "2027-01-30", today })).toBe(
      `İzin en fazla ${MAX_LEAVE_DAYS} gün olabilir.`,
    );
  });

  test("yıl yazım hatası (2026 yerine 2027) yakalanır", () => {
    expect(leaveRangeError({ startsOn: "2026-12-01", endsOn: "2027-12-01", today })).toBe(
      `İzin en fazla ${MAX_LEAVE_DAYS} gün olabilir.`,
    );
  });

  test("hem ters hem geçmiş: önce ters sıra hatası söylenir", () => {
    expect(leaveRangeError({ startsOn: "2026-11-10", endsOn: "2026-11-05", today })).toBe(
      "Bitiş tarihi başlangıç tarihinden önce olamaz.",
    );
  });
});
