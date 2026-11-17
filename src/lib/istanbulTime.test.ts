import { describe, expect, test } from "vitest";
import { minutesInIstanbul, nowInIstanbul, toIstanbulIso } from "./istanbulTime";

describe("minutesInIstanbul (veritabanı → dakika)", () => {
  test("UTC 11:00 → Türkiye 14:00 → 840", () => {
    expect(minutesInIstanbul("2026-11-24T11:00:00+00:00")).toBe(840);
  });

  test("zaten Türkiye saatiyle yazılmışsa olduğu gibi: 10:00 → 600", () => {
    expect(minutesInIstanbul("2026-11-24T10:00:00+03:00")).toBe(600);
  });
});

describe("nowInIstanbul", () => {
  test("UTC'de hâlâ 24 Kasım 21:30 iken Türkiye'de 25 Kasım 00:30", () => {
    expect(nowInIstanbul(new Date("2026-11-24T21:30:00Z"))).toEqual({ date: "2026-11-25", minutes: 30 });
  });
});

describe("toIstanbulIso (müşterinin seçimi → veritabanı)", () => {
  test("24 Kasım 13:15", () => {
    expect(toIstanbulIso("2026-11-24", 795)).toBe("2026-11-24T13:15:00+03:00");
  });

  test("gidiş-dönüş: çevirip geri çevirince aynı dakika", () => {
    expect(minutesInIstanbul(toIstanbulIso("2026-11-24", 795))).toBe(795);
  });
});
