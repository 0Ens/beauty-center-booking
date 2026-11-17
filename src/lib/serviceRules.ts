/*
 * İŞLEM KURALLARI (panelden ekleme / düzenleme)
 *
 * Saf fonksiyonlar → src/lib/serviceRules.test.ts
 */

/*
 * slugify: işlem adından URL'de kullanılacak adı üretir.
 *   "Kaş Tasarımı"            → "kas-tasarimi"
 *   "Kirpik Lifting & Boyama" → "kirpik-lifting-boyama"
 *
 * Sadece işlem EKLENİRKEN çalışır; ad sonradan değişse de slug aynı kalır
 * (yoksa paylaşılmış eski linkler 404 verir).
 *
 * Adımlar:
 *   1) Türkçe harfleri İngilizce karşılıklarıyla değiştir (TR tablosu aşağıda)
 *   2) Küçük harfe çevir
 *   3) Harf ve rakam DIŞINDA kalan her şeyi (boşluk, &, parantez...) "-" yap.
 *      Arka arkaya gelenler TEK "-" olsun.
 *   4) Baştaki ve sondaki "-" leri sil
 *
 * İpucu: string.replace(/düzenli-ifade/g, ...) ve [...] karakter sınıfları.
 *   "abc".replace(/[ab]/g, (harf) => harf.toUpperCase()) → "ABc"
 *   /[^a-z0-9]+/g → "a-z ve 0-9 OLMAYAN, bir veya daha fazla karakter"
 */
const TR: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
  Ç: "c", Ğ: "g", İ: "i", I: "i", Ö: "o", Ş: "s", Ü: "u",
};

export function slugify(name: string): string {
  return (
    name
      // 1) Türkçe harfler → İngilizce. ÖNCE bu: "İ" küçültülmeden "i" olmalı,
      //    yoksa toLowerCase onu "i" + üst nokta (2 karakter) yapar
      .replace(/[çğıöşüÇĞİIÖŞÜ]/g, (harf) => TR[harf])
      // 2) Küçük harf (artık sadece İngilizce harfler kaldı, tuzak yok)
      .toLowerCase()
      // 3) Harf/rakam olmayan her DİZİ ("  ", " & ", " (") tek bir "-" olur
      .replace(/[^a-z0-9]+/g, "-")
      // 4) Baştaki (^-+) veya sondaki (-+$) tireler silinir
      .replace(/^-+|-+$/g, "")
  );
}

/*
 * priceRangeError: fiyat alanları geçerli mi?
 *   - İkisi de boş → geçerli ("fiyat için arayın")
 *   - Sadece en düşük dolu → geçerli ("1500 TL'den başlayan")
 *   - İkisi eşit → geçerli (tek fiyat)
 *   - Sadece en yüksek dolu → "Fiyat aralığı için en düşük fiyatı da girin."
 *   - En yüksek < en düşük → "En yüksek fiyat en düşük fiyattan küçük olamaz."
 * Negatif sayılar formda zaten engelleniyor; burada düşünmene gerek yok.
 */
export function priceRangeError(min: number | null, max: number | null): string | null {
  // "=== null" ile bakıyoruz: "!min" yazsaydık 0 TL de boş sayılırdı
  if (min === null && max !== null) return "Fiyat aralığı için en düşük fiyatı da girin.";
  if (min !== null && max !== null && max < min) return "En yüksek fiyat en düşük fiyattan küçük olamaz.";
  return null;
}
