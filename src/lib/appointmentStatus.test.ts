import { describe, expect, test } from "vitest";
import { nextStatuses, statusesThatCanBecome } from "./appointmentStatus";

describe("nextStatuses", () => {
  test("bekleyen randevu onaylanabilir veya iptal edilebilir", () => {
    expect(nextStatuses("pending")).toEqual(["confirmed", "cancelled"]);
  });

  test("onaylı randevu sadece iptal edilebilir (beklemeye alınamaz)", () => {
    expect(nextStatuses("confirmed")).toEqual(["cancelled"]);
  });

  test("iptal edilen randevu geri alınabilir (tekrar onaylanır)", () => {
    expect(nextStatuses("cancelled")).toEqual(["confirmed"]);
  });

  test("hiçbir durum kendisine geçmez", () => {
    for (const s of ["pending", "confirmed", "cancelled"] as const) {
      expect(nextStatuses(s)).not.toContain(s);
    }
  });
});

describe("statusesThatCanBecome", () => {
  test("onaylı duruma beklemeden ve iptalden gelinir", () => {
    expect(statusesThatCanBecome("confirmed")).toEqual(["pending", "cancelled"]);
  });

  test("iptale beklemeden ve onaylıdan gelinir", () => {
    expect(statusesThatCanBecome("cancelled")).toEqual(["pending", "confirmed"]);
  });

  test("beklemeye hiçbir yerden dönülmez", () => {
    expect(statusesThatCanBecome("pending")).toEqual([]);
  });
});
