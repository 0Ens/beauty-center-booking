import { describe, expect, it } from "vitest";
import { normalizeSiteUrl } from "./siteUrl";

describe("normalizeSiteUrl", () => {
  it("boşsa geliştirme adresini verir", () => {
    expect(normalizeSiteUrl(undefined)).toBe("http://localhost:3000");
    expect(normalizeSiteUrl("   ")).toBe("http://localhost:3000");
  });

  it("sondaki eğik çizgileri siler", () => {
    expect(normalizeSiteUrl("https://ornek.com.tr/")).toBe("https://ornek.com.tr");
    expect(normalizeSiteUrl("https://ornek.com.tr//")).toBe("https://ornek.com.tr");
  });

  it("düzgün adresi olduğu gibi bırakır", () => {
    expect(normalizeSiteUrl(" https://ornek.com.tr ")).toBe("https://ornek.com.tr");
  });
});
