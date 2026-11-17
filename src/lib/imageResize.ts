/*
 * FOTOĞRAF KÜÇÜLTME HESABI (öncesi/sonrası yükleme)
 *
 * fitWithin: fotoğrafın yeni boyutunu hesaplar.
 *   - En uzun kenar max'ı geçmesin
 *   - En/boy oranı korunsun (fotoğraf basık/uzamış görünmesin)
 *   - Zaten küçükse ASLA büyütülmesin (büyütmek sadece bulanıklaştırır)
 *   - Sonuç tam sayı piksel olsun (Math.round)
 *
 *   fitWithin(4032, 3024, 1600) → { width: 1600, height: 1200 }
 *   fitWithin(800, 600, 1600)   → { width: 800, height: 600 }
 *
 * Saf fonksiyon → src/lib/imageResize.test.ts
 */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  // Zaten sığıyorsa dokunma
  if (max >= width && max >= height) {
    return { width, height };
  }

  // Ölçek: en uzun kenarı tam max'a indiren oran (0 < scale < 1)
  const scale = max / Math.max(width, height);

  // Dönüş: önce çarp, sonra yuvarla.
  // { ad: değer, ad: değer } → iki sayıyı TEK bir değer olarak döndürmenin yolu
  return { width: Math.round(scale * width), height: Math.round(scale * height) };
}
