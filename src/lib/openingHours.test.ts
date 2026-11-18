import { describe, expect, it } from "vitest";
import type { WorkingHoursRow } from "./hours";
import { toOpeningHoursSpecification } from "./openingHours";

const open = (weekday: number, from = "10:00:00", to = "19:00:00"): WorkingHoursRow => ({
  weekday,
  is_closed: false,
  open_time: from,
  close_time: to,
});
const closed = (weekday: number): WorkingHoursRow => ({
  weekday,
  is_closed: true,
  open_time: null,
  close_time: null,
});

describe("toOpeningHoursSpecification", () => {
  it("açık bir günü schema.org biçimine çevirir (saniyeler atılır)", () => {
    expect(toOpeningHoursSpecification([open(1)])).toEqual([
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "10:00", closes: "19:00" },
    ]);
  });

  it("weekday 0 Pazar'dır → Sunday", () => {
    expect(toOpeningHoursSpecification([open(0, "11:00:00", "16:30:00")])).toEqual([
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "11:00", closes: "16:30" },
    ]);
  });

  it("kapalı günleri listeye yazmaz", () => {
    expect(toOpeningHoursSpecification([closed(0)])).toEqual([]);
  });

  it("gerçek hafta: Pzt–Cmt açık, Pazar kapalı → 6 gün, Sunday yok", () => {
    const week = [closed(0), open(1), open(2), open(3), open(4), open(5), open(6)];
    const result = toOpeningHoursSpecification(week);

    expect(result).toHaveLength(6);
    expect(result.map((r) => r.dayOfWeek)).not.toContain("Sunday");
    expect(result.map((r) => r.dayOfWeek)).toContain("Saturday");
  });
});
