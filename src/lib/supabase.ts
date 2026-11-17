/*
 * SUPABASE BAĞLANTISI (ziyaretçi sayfaları için)
 *
 * Bağlantıyı tek bir yerde oluşturup her yerden bunu kullanıyoruz.
 * Adres ve anahtar koda yazılmıyor; .env.local'dan (ortam değişkenleri) okunuyor.
 *
 * Bu bağlantı "anon" rolüyle çalışır: sadece RLS'nin ziyaretçiye
 * izin verdiklerini görebilir. Aşama 5'te salon sahibinin girişi için
 * oturum (cookie) bilen ayrı bir bağlantı daha yazacağız.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Değişken eksikse anlaşılır bir hatayla hemen dur. Yoksa ileride
// "fetch failed" gibi neyin eksik olduğunu söylemeyen bir hata alırdık.
if (!url || !key) {
  throw new Error(
    "Supabase ortam değişkenleri eksik. .env.example dosyasını .env.local olarak kopyalayıp doldurun.",
  );
}

export const supabase = createClient(url, key, {
  // Sunucuda kullanıcı oturumu tutmuyoruz (ziyaretçi bağlantısı)
  auth: { persistSession: false },
});
