import { describe, expect, it } from "vitest";
import { isStagingFlag, isTestBookingName } from "./staging";

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

describe("isStagingFlag", () => {
  it("'1' ve 'true' → deneme sürümü", () => {
    expect(isStagingFlag("1")).toBe(true);
    expect(isStagingFlag("true")).toBe(true);
  });

  it("baştaki/sondaki boşluk ve büyük harf sorun değil", () => {
    expect(isStagingFlag(" TRUE ")).toBe(true);
  });

  it("tanımsız, boş, '0', 'false' → gerçek site", () => {
    expect(isStagingFlag(undefined)).toBe(false);
    expect(isStagingFlag("")).toBe(false);
    expect(isStagingFlag("0")).toBe(false);
    expect(isStagingFlag("false")).toBe(false);
  });

  it("tanımadığımız bir değer → gerçek site (yanlışlıkla deneme şeridi çıkmasın)", () => {
    expect(isStagingFlag("evet")).toBe(false);
  });
});
