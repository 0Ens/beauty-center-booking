import { describe, expect, it } from "vitest";
import { fitWithin } from "./imageResize";

describe("fitWithin", () => {
  it("zaten küçük fotoğrafa dokunmaz", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it("tam sınırdaki fotoğrafa dokunmaz", () => {
    expect(fitWithin(1600, 1200, 1600)).toEqual({ width: 1600, height: 1200 });
  });

  it("yatay iPhone fotoğrafını küçültür", () => {
    expect(fitWithin(4032, 3024, 1600)).toEqual({ width: 1600, height: 1200 });
  });

  it("dikey iPhone fotoğrafını küçültür", () => {
    expect(fitWithin(3024, 4032, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it("dar ama çok uzun fotoğrafı küçültür (eni sınırın altında olsa bile)", () => {
    expect(fitWithin(1000, 3000, 1600)).toEqual({ width: 533, height: 1600 });
  });

  it("geniş ama kısa fotoğrafı küçültür (boyu sınırın altında olsa bile)", () => {
    expect(fitWithin(3000, 1000, 1600)).toEqual({ width: 1600, height: 533 });
  });

  it("kare fotoğrafı küçültür", () => {
    expect(fitWithin(2000, 2000, 1600)).toEqual({ width: 1600, height: 1600 });
  });
});
