/*
 * FOTOĞRAFI TARAYICIDA KÜÇÜLTME
 *
 * Telefon fotoğrafı 4032×3024 ve 3-8 MB. Sitede en fazla ~800px genişlikte
 * gösteriliyor; 1600px (retina ekranlar için 2 katı) fazlasıyla yeter.
 *
 * Canvas'a çizip JPEG olarak geri almanın İKİ faydası var:
 *   1) Dosya ~300-500 KB'a iner (yöneticinin mobil verisi + Supabase kotası)
 *   2) EXIF silinir: canvas sadece pikselleri tutar. Fotoğrafın içindeki
 *      KONUM (GPS), tarih, telefon modeli yeni dosyaya geçmez. Müşteri
 *      fotoğrafında konum bilgisi bulunması KVKK açısından istemediğimiz bir şey.
 *
 * Neden WebP değil JPEG: iPhone Safari canvas'tan WebP üretemiyor (sessizce
 * PNG verir, dosya büyür). JPEG her tarayıcıda var.
 *
 * HEIC (iPhone formatı): Safari galeriden seçilen fotoğrafı yüklemeden önce
 * JPEG'e çeviriyor, çevirmese de HEIC'i açabiliyor. Bilgisayardaki Chrome
 * HEIC açamaz → anlaşılır bir hata gösteriyoruz.
 */
import { fitWithin } from "./imageResize";

/** En uzun kenar (piksel) */
export const PHOTO_MAX_EDGE = 1600;
/** Yüklenen her fotoğraf için üst sınır. Storage kovasında da aynı sınır var (0013). */
export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
/** JPEG kalitesi (0-1). 0.85 gözle fark edilmez, boyutu yarıya indirir. */
const PHOTO_QUALITY = 0.85;

export type ResizedPhoto = { blob: Blob; width: number; height: number };

/** Kullanıcıya gösterilecek mesajı taşıyan hata */
export class PhotoError extends Error {}

/** Sadece tarayıcıda çalışır (canvas). */
export async function resizeToJpeg(file: File): Promise<ResizedPhoto> {
  // Dosyaya geçici bir adres ver (blob:...) → <img> onu açabilsin
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    try {
      // decode: görsel tamamen açılana kadar bekle; açılamazsa hata verir
      await img.decode();
    } catch {
      throw new PhotoError(
        "Bu fotoğraf açılamadı. Telefondan galeriden seçin; bilgisayardaysanız JPEG veya PNG kullanın.",
      );
    }

    // Tarayıcı EXIF'teki "yan çevrilmiş" bilgisini uyguluyor; naturalWidth dik
    // tutulan fotoğrafta zaten dik ölçüyü verir.
    const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, PHOTO_MAX_EDGE);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new PhotoError("Tarayıcınız fotoğrafı işleyemedi.");

    // JPEG'de saydamlık yok: saydam PNG'nin arkası siyah olmasın, beyaz olsun
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    // toBlob eski usul (callback) çalışıyor → Promise'e sarıyoruz ki await edebilelim
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", PHOTO_QUALITY));
    if (!blob || blob.type !== "image/jpeg") throw new PhotoError("Fotoğraf JPEG'e çevrilemedi.");
    if (blob.size > PHOTO_MAX_BYTES) throw new PhotoError("Fotoğraf küçültüldükten sonra bile çok büyük.");

    return { blob, width, height };
  } finally {
    // Geçici adresi bırak (yoksa sayfa kapanana kadar bellekte kalır)
    URL.revokeObjectURL(url);
  }
}
