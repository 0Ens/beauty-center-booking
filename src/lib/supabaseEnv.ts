/*
 * Supabase adresi ve herkese açık (publishable) anahtar.
 * Hem ziyaretçi bağlantısı (supabase.ts) hem de oturumlu bağlantılar
 * (supabaseServer.ts, proxy.ts) buradan okur; kontrol tek yerde.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Değişken eksikse anlaşılır bir hatayla hemen dur. Yoksa ileride
// "fetch failed" gibi neyin eksik olduğunu söylemeyen bir hata alırdık.
if (!url || !key) {
  throw new Error(
    "Supabase ortam değişkenleri eksik. .env.example dosyasını .env.local olarak kopyalayıp doldurun.",
  );
}

export const supabaseUrl: string = url;
export const supabaseKey: string = key;
