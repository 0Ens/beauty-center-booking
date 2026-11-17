/*
 * ÖNCESİ / SONRASI KAYDIRICISI — konum hesabı
 *
 * Bu fonksiyon "saf" (pure) olacak: sadece aldığı değerlere bakar, dışarıdaki
 * hiçbir şeyi değiştirmez. Aynı girdiye her zaman aynı sonucu verir.
 * Bu yüzden test etmesi çok kolay; React bileşeninden ayrı bir dosyada tutuyoruz.
 *
 * clientX → farenin (ya da parmağın) ekranın solundan uzaklığı (px)
 * rect    → kutunun ekrandaki yeri: rect.left (sol kenar), rect.width (genişlik)
 * Dönüş   → çizginin kutu içindeki konumu, 0 ile 100 arasında (yüzde)
 */
export function hesaplaYuzde(clientX: number, rect: DOMRect): number {
  // 0. genişlik 0 ise (fotoğraf yüklenmemiş / kutu gizli) 0'a bölme → NaN olur.
  //    Hesap yapmadan çizgiyi başlangıç konumunda (ortada) bırak.
  if (rect.width === 0) return 50;

  const mesafe = clientX - rect.left; // 1. farenin kutu içindeki konumu (px)
  const oran = mesafe / rect.width; // 2. genişliğe oranı (0 ile 1 arası)
  const yuzde = oran * 100; // 3. yüzdeye çevir

  // 4. sınırlama: fare kutunun dışına çıksa bile çizgi kutuda kalsın
  if (yuzde < 0) return 0;
  if (yuzde > 100) return 100;
  return yuzde;
}
