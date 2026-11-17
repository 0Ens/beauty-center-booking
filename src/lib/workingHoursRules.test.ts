import { describe, expect, test } from "vitest";
import { toMinutes } from "./slots";
import { fitsHours, type DayHours } from "./workingHoursRules";

// 10:00 – 19:00 açık bir gün
const day: DayHours = { closed: false, open: toMinutes("10:00"), close: toMinutes("19:00") };
const appt = (start: string, end: string) => ({ start: toMinutes(start), end: toMinutes(end) });

describe("fitsHours", () => {
  test("gün ortasındaki randevu sığar", () => {
    expect(fitsHours(appt("14:00", "15:00"), day)).toBe(true);
  });

  test("tam açılışta başlayan randevu sığar", () => {
    expect(fitsHours(appt("10:00", "11:00"), day)).toBe(true);
  });

  test("tam kapanışta biten randevu sığar (bitiş hariç)", () => {
    expect(fitsHours(appt("18:00", "19:00"), day)).toBe(true);
  });

  test("açılıştan önce başlayan randevu sığmaz", () => {
    expect(fitsHours(appt("09:45", "10:45"), day)).toBe(false);
  });

  test("kapanıştan sonra biten randevu sığmaz", () => {
    expect(fitsHours(appt("18:30", "19:30"), day)).toBe(false);
  });

  test("tamamen kapanıştan sonra olan randevu sığmaz", () => {
    expect(fitsHours(appt("19:00", "20:00"), day)).toBe(false);
  });

  test("kapalı günde hiçbir randevu sığmaz", () => {
    expect(fitsHours(appt("14:00", "15:00"), { ...day, closed: true })).toBe(false);
  });

  test("örnek: cumartesi kapanış 19:00 → 17:00 olunca 17:30 randevusu dışarıda kalır", () => {
    const newSaturday: DayHours = { ...day, close: toMinutes("17:00") };
    expect(fitsHours(appt("17:30", "18:30"), newSaturday)).toBe(false);
    expect(fitsHours(appt("16:00", "17:00"), newSaturday)).toBe(true);
  });
});
