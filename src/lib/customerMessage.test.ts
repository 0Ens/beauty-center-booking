import { describe, expect, test } from "vitest";
import { customerMessage, type MessageInput } from "./customerMessage";

const base: MessageInput = {
  status: "confirmed",
  customerName: "TEST Kullanıcı",
  serviceName: "Kirpik Lifting",
  date: "2026-11-24",
  time: "14:00",
};

describe("customerMessage", () => {
  test("onaylandı: gün, saat ve işlem mesajda", () => {
    expect(customerMessage(base, "Salon")).toBe(
      "Merhaba TEST Kullanıcı, 24 Kasım 2026 Salı saat 14:00 için Kirpik Lifting randevunuz onaylanmıştır. Görüşmek üzere! Salon",
    );
  });

  test("iptal: iptal edildiğini söyler", () => {
    expect(customerMessage({ ...base, status: "cancelled" }, "Salon")).toContain("iptal edilmiştir");
  });

  test("beklemede: talep hakkında yazıldığını söyler", () => {
    expect(customerMessage({ ...base, status: "pending" }, "Salon")).toContain("randevu talebiniz hakkında");
  });
});
