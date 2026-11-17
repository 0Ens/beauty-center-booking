import { describe, expect, test } from "vitest";
import { formatPhone, toInternational } from "./phone";

describe("toInternational (WhatsApp ve tel: linkleri için)", () => {
  test("başında 0 → 90 eklenir, 0 düşer", () => {
    expect(toInternational("05001234567")).toBe("905001234567");
  });

  test("0'sız 10 hane → başına 90", () => {
    expect(toInternational("5001234567")).toBe("905001234567");
  });

  test("zaten 90'lı → olduğu gibi", () => {
    expect(toInternational("905001234567")).toBe("905001234567");
  });

  test("boşluk ve işaretler atılır", () => {
    expect(toInternational("+90 (500) 123 45 67")).toBe("905001234567");
  });

  test("tanınmayan biçim → null (yanlış kişiye mesaj gitmesin)", () => {
    expect(toInternational("4412345678901")).toBeNull();
    expect(toInternational("12345")).toBeNull();
  });
});

describe("formatPhone", () => {
  test("05001234567 → 0500 123 45 67", () => {
    expect(formatPhone("05001234567")).toBe("0500 123 45 67");
  });

  test("90'lı kayıt da yerel biçimde gösterilir", () => {
    expect(formatPhone("905001234567")).toBe("0500 123 45 67");
  });

  test("tanınmazsa olduğu gibi", () => {
    expect(formatPhone("4412345678901")).toBe("4412345678901");
  });
});
