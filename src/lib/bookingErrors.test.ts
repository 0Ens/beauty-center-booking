import { describe, expect, it } from "vitest";
import { bookingErrorMessage, GENERIC, SLOT_TAKEN, SLOT_UNAVAILABLE } from "./bookingErrors";

describe("bookingErrorMessage", () => {
  it("çakışma (23P01) → 'az önce doldu'", () => {
    const error = {
      code: "23P01",
      message: 'conflicting key value violates exclusion constraint "appointments_no_overlap"',
    };
    expect(bookingErrorMessage(error)).toBe(SLOT_TAKEN);
  });

  it("bizim kodumuz message'da gelir: in_past", () => {
    expect(bookingErrorMessage({ code: "P0001", message: "in_past" })).toBe(SLOT_UNAVAILABLE);
  });

  it("bizim kodumuz: blocked_date", () => {
    expect(bookingErrorMessage({ code: "P0001", message: "blocked_date" })).toMatch(/kapalı/);
  });

  it("spam freni (0015): saatlik sınır → 'biraz sonra'", () => {
    expect(bookingErrorMessage({ code: "P0001", message: "too_many_requests" })).toMatch(/biraz sonra/);
  });

  it("spam freni (0015): numara başına sınır → 'bizi arayın'", () => {
    expect(bookingErrorMessage({ code: "P0001", message: "too_many_for_phone" })).toMatch(/bizi arayın/);
  });

  it("tanımadığımız bir kod → genel mesaj", () => {
    expect(bookingErrorMessage({ code: "P0001", message: "yeni_bir_kod" })).toBe(GENERIC);
  });

  it("bağlantı hatası (code yok) → genel mesaj", () => {
    expect(bookingErrorMessage({ message: "fetch failed" })).toBe(GENERIC);
  });
});
