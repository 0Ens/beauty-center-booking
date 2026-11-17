import { describe, expect, it } from "vitest";
import { adminRedirect } from "./adminRedirect";

describe("adminRedirect", () => {
  describe("giriş yapılmamış", () => {
    it("panel ana sayfası → giriş", () => {
      expect(adminRedirect("/admin", false)).toBe("/admin/giris");
    });

    it("panelin alt sayfası → giriş", () => {
      expect(adminRedirect("/admin/randevular", false)).toBe("/admin/giris");
    });

    it("giriş sayfasının kendisi → yönlendirme YOK (yoksa sonsuz döngü)", () => {
      expect(adminRedirect("/admin/giris", false)).toBeNull();
    });
  });

  describe("giriş yapılmış", () => {
    it("giriş sayfası → panel", () => {
      expect(adminRedirect("/admin/giris", true)).toBe("/admin");
    });

    it("panel sayfaları → yönlendirme yok", () => {
      expect(adminRedirect("/admin", true)).toBeNull();
      expect(adminRedirect("/admin/randevular", true)).toBeNull();
    });
  });
});
