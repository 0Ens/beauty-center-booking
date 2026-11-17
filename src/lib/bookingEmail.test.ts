import { describe, expect, it } from "vitest";
import { bookingEmailSubject, bookingEmailText, type BookingSummary } from "./bookingEmail";

const booking: BookingSummary = {
  id: 42,
  serviceName: "Kirpik Lifting",
  date: "2026-11-24",
  time: "15:00",
};

describe("bookingEmailSubject", () => {
  it("işlem, okunur tarih ve saat", () => {
    expect(bookingEmailSubject(booking)).toBe("Yeni randevu talebi: Kirpik Lifting – 24 Kasım 2026 Salı 15:00");
  });
});

describe("bookingEmailText", () => {
  it("işlem, tarih, saat ve randevu no var", () => {
    const text = bookingEmailText(booking);
    expect(text).toContain("İşlem:   Kirpik Lifting");
    expect(text).toContain("24 Kasım 2026 Salı");
    expect(text).toContain("Saat:    15:00");
    expect(text).toContain("Randevu no: 42");
  });

  it("KVKK: müşteri bilgisi alanı YOK, panele yönlendiriyor", () => {
    const text = bookingEmailText(booking);
    expect(text).not.toContain("Müşteri:");
    expect(text).not.toContain("Telefon:");
    expect(text).not.toContain("Not:");
    expect(text).toContain("yönetim panelinin Randevular sayfasında");
  });

  it("KVKK: fonksiyona fazladan kişisel veri gelse bile e-postaya girmez", () => {
    // TypeScript'i atlatıp ad/telefon gönderen eski bir kod parçası düşünelim
    const leaky = { ...booking, name: "Ayşe Yılmaz", phone: "05321234567", note: "hamileyim" } as BookingSummary;
    const text = bookingEmailText(leaky) + bookingEmailSubject(leaky);
    expect(text).not.toContain("Ayşe");
    expect(text).not.toContain("05321234567");
    expect(text).not.toContain("hamile");
  });
});
