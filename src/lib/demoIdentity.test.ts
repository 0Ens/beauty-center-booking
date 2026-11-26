import { describe, expect, it } from "vitest";
import { demoIdentity } from "./demoIdentity";

describe("demoIdentity", () => {
  it("ad ve telefon aynı 4 haneli numarayı taşır", () => {
    expect(demoIdentity(() => 0.4821)).toEqual({ name: "Demo Misafir 4821", phone: "05000004821" });
  });

  it("küçük sayılar sıfırla doldurulur", () => {
    expect(demoIdentity(() => 0)).toEqual({ name: "Demo Misafir 0000", phone: "05000000000" });
    expect(demoIdentity(() => 0.0007)).toEqual({ name: "Demo Misafir 0007", phone: "05000000007" });
  });

  it("en büyük değer 9999'u geçmez", () => {
    expect(demoIdentity(() => 0.99999999).phone).toBe("05000009999");
  });

  it("telefon veritabanı kuralına uyar: sadece rakam, 10–13 hane, 0500 ile başlar", () => {
    for (let i = 0; i < 50; i++) {
      const { phone, name } = demoIdentity();
      expect(phone).toMatch(/^0500\d{7}$/);
      expect(name.length).toBeGreaterThanOrEqual(2);
    }
  });
});
