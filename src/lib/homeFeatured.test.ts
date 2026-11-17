import { describe, expect, it } from "vitest";
import { HOME_FEATURED_LIMIT, pickHomeFeatured } from "./homeFeatured";

// Kısa yardımcı: id + featured yeterli
const e = (id: number, featured: boolean) => ({ id, featured });
const ids = (list: { id: number }[]) => list.map((x) => x.id);

describe("pickHomeFeatured", () => {
  it("sınır 3", () => {
    expect(HOME_FEATURED_LIMIT).toBe(3);
  });

  it("sadece işaretli olanları alır", () => {
    expect(ids(pickHomeFeatured([e(1, true), e(2, false), e(3, true)]))).toEqual([1, 3]);
  });

  it("en fazla 3 tane döner, gelen sırayı korur", () => {
    const list = [e(1, true), e(2, true), e(3, true), e(4, true), e(5, true)];
    expect(ids(pickHomeFeatured(list))).toEqual([1, 2, 3]);
  });

  it("işaretsizler aradaysa atlanır, sınır işaretlilere uygulanır", () => {
    const list = [e(1, false), e(2, true), e(3, false), e(4, true), e(5, true), e(6, true)];
    expect(ids(pickHomeFeatured(list))).toEqual([2, 4, 5]);
  });

  it("işaretli yoksa boş liste", () => {
    expect(pickHomeFeatured([e(1, false), e(2, false)])).toEqual([]);
  });

  it("boş liste → boş liste", () => {
    expect(pickHomeFeatured([])).toEqual([]);
  });

  it("verilen listeyi değiştirmez", () => {
    const list = [e(1, true), e(2, false), e(3, true), e(4, true), e(5, true)];
    pickHomeFeatured(list);
    expect(ids(list)).toEqual([1, 2, 3, 4, 5]);
  });
});
