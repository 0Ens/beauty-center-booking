import { describe, expect, it } from "vitest";
import { isTestBookingName, parseSiteMode } from "./siteMode";

describe("parseSiteMode", () => {
  it("tanımsız ya da boş → production (gerçek site)", () => {
    expect(parseSiteMode(undefined)).toBe("production");
    expect(parseSiteMode("")).toBe("production");
    expect(parseSiteMode("  ")).toBe("production");
  });

  it("geçerli değerler, boşluk ve büyük harf sorun değil", () => {
    expect(parseSiteMode("production")).toBe("production");
    expect(parseSiteMode("staging")).toBe("staging");
    expect(parseSiteMode(" DEMO ")).toBe("demo");
  });

  it("tanımadığımız değer → hata (demo yanlışlıkla gerçek siteye dönmesin)", () => {
    expect(() => parseSiteMode("dmeo")).toThrow(/SITE_MODE/);
    expect(() => parseSiteMode("1")).toThrow(/SITE_MODE/);
  });
});

describe("isTestBookingName", () => {
  it("'TEST' ile başlayan ad → test randevusu", () => {
    expect(isTestBookingName("TEST Ayşe")).toBe(true);
    expect(isTestBookingName("test ayşe")).toBe(true);
    expect(isTestBookingName("  TEST")).toBe(true);
  });

  it("gerçek bir ad → reddedilir", () => {
    expect(isTestBookingName("Ayşe Yılmaz")).toBe(false);
  });

  it("'test' adın ortasında geçiyorsa yetmez", () => {
    expect(isTestBookingName("Ayşe TEST")).toBe(false);
  });
});
