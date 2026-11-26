import { describe, expect, it } from "vitest";
import { isDemoAdminEmail } from "./demoAdmin";

describe("isDemoAdminEmail", () => {
  it("aynı adres → demo hesabı", () => {
    expect(isDemoAdminEmail("demo@example.com", "demo@example.com")).toBe(true);
  });

  it("büyük/küçük harf ve kenardaki boşluklar fark etmez", () => {
    expect(isDemoAdminEmail("Demo@Example.com", "  demo@example.com ")).toBe(true);
  });

  it("başka adres → demo hesabı değil", () => {
    expect(isDemoAdminEmail("sahip@example.com", "demo@example.com")).toBe(false);
  });

  it("ortam değişkeni yoksa ya da boşsa hiç kimse demo hesabı sayılmaz", () => {
    expect(isDemoAdminEmail("demo@example.com", undefined)).toBe(false);
    expect(isDemoAdminEmail("", "")).toBe(false);
    expect(isDemoAdminEmail("", "   ")).toBe(false);
  });
});
