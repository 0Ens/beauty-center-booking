import { describe, expect, it } from "vitest";
import { bookingEmailSubject, bookingEmailText, type BookingSummary } from "./bookingEmail";

const booking: BookingSummary = {
  id: 42,
  serviceName: "Kirpik Lifting",
  date: "2026-11-24",
  time: "15:00",
  name: "Ayşe Yılmaz",
  phone: "05321234567",
  note: "",
};

describe("bookingEmailSubject", () => {
  it("işlem, okunur tarih ve saat", () => {
    expect(bookingEmailSubject(booking)).toBe("Yeni randevu talebi: Kirpik Lifting – 24 Kasım 2026 Salı 15:00");
  });
});

describe("bookingEmailText", () => {
  it("müşteri bilgileri ve randevu no var", () => {
    const text = bookingEmailText(booking);
    expect(text).toContain("Müşteri: Ayşe Yılmaz");
    expect(text).toContain("Telefon: 05321234567");
    expect(text).toContain("Randevu no: 42");
  });

  it("not boşsa tire", () => {
    expect(bookingEmailText(booking)).toContain("Not:     -");
  });
});
