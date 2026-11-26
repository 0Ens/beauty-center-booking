/*
 * FOTOĞRAF ADRESİ → STORAGE'DAKİ DOSYA ADI
 *
 * Tabloda fotoğrafın TAM adresi duruyor (sitede doğrudan <Image src> olarak
 * kullanılıyor):
 *   https://abc.supabase.co/storage/v1/object/public/before-after/3f2a.jpg
 *
 * Örneği silerken dosyayı da Storage'dan silmemiz lazım; Storage ise adresi
 * değil kovanın İÇİNDEKİ adı ister: "3f2a.jpg"
 *
 * storagePathFromUrl(url, base):
 *   base = kovanın adres başı, sonu "/" ile biter:
 *     "https://abc.supabase.co/storage/v1/object/public/before-after/"
 *   - url, base ile başlıyorsa → base'den SONRAKİ kısım ("3f2a.jpg")
 *   - Başlamıyorsa → null  (örnek çizimler "/ornek/..." Storage'da değil,
 *                            silinecek dosyaları yok)
 *   - base ile başlıyor ama sonrası BOŞSA → null (dosya adı yok)
 *
 * İpucu: "merhaba".startsWith("mer") → true
 *        "merhaba".slice(3)          → "haba"   (3. karakterden sonrası)
 *        "mer".length                → 3
 *
 * Saf fonksiyon → src/lib/storagePath.test.ts
 */
export function storagePathFromUrl(url: string, base: string): string | null {
  // Bizim kovanın adresiyle başlamıyorsa Storage'da değil
  if (!url.startsWith(base)) return null;

  // base'in uzunluğu kadar karakteri atla → geriye dosya adı kalır
  const path = url.slice(base.length);

  // Adres tam olarak kovanın kendisiyse dosya adı yok
  return path === "" ? null : path;
}
