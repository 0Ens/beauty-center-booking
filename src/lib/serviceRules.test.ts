import { describe, expect, test } from "vitest";
import { priceRangeError, slugify } from "./serviceRules";

describe("slugify", () => {
  test("boşluklar tireye döner", () => {
    expect(slugify("Cilt Bakımı")).toBe("cilt-bakimi");
  });

  test("Türkçe küçük harfler", () => {
    expect(slugify("kaş tasarımı göz altı üçlü")).toBe("kas-tasarimi-goz-alti-uclu");
  });

  test("Türkçe büyük harfler", () => {
    expect(slugify("ÇĞÖŞÜ")).toBe("cgosu");
  });

  // Tuzak: JavaScript'te "İ".toLowerCase() → "i̇" (i + üstte nokta işareti, 2 karakter!)
  test("büyük İ tek bir i olur", () => {
    expect(slugify("İpek Kirpik")).toBe("ipek-kirpik");
  });

  test("büyük I da i olur (Türkçede ı'nın büyüğü)", () => {
    expect(slugify("IŞIK TERAPİSİ")).toBe("isik-terapisi");
  });

  test("& ve parantez gibi işaretler atılır, tek tire kalır", () => {
    expect(slugify("Kirpik Lifting & Boyama")).toBe("kirpik-lifting-boyama");
    expect(slugify("Hydrafacial (60 dk)")).toBe("hydrafacial-60-dk");
  });

  test("baştaki/sondaki boşluk ve tireler silinir, arka arkaya boşluklar tek tire olur", () => {
    expect(slugify("  Lazer   Epilasyon  ")).toBe("lazer-epilasyon");
    expect(slugify("--Lazer--")).toBe("lazer");
  });

  test("rakamlar kalır", () => {
    expect(slugify("3 Seans Paket")).toBe("3-seans-paket");
  });

  test("sadece işaretlerden oluşan ad → boş (form bunu reddedecek)", () => {
    expect(slugify("&&& !!")).toBe("");
  });
});

describe("priceRangeError", () => {
  test("ikisi de boş → geçerli (fiyat için arayın)", () => {
    expect(priceRangeError(null, null)).toBeNull();
  });

  test("sadece en düşük → geçerli (… TL'den başlayan)", () => {
    expect(priceRangeError(1500, null)).toBeNull();
  });

  test("aralık → geçerli", () => {
    expect(priceRangeError(1000, 2000)).toBeNull();
  });

  test("eşit → geçerli (tek fiyat)", () => {
    expect(priceRangeError(1500, 1500)).toBeNull();
  });

  test("0 TL geçerli bir en düşük fiyattır (boş değildir)", () => {
    expect(priceRangeError(0, 500)).toBeNull();
  });

  test("sadece en yüksek → hata", () => {
    expect(priceRangeError(null, 2000)).toBe("Fiyat aralığı için en düşük fiyatı da girin.");
  });

  test("en yüksek < en düşük → hata", () => {
    expect(priceRangeError(2000, 1000)).toBe("En yüksek fiyat en düşük fiyattan küçük olamaz.");
  });
});
