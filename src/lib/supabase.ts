/*
 * SUPABASE BAĞLANTISI (ziyaretçi sayfaları için)
 *
 * Bağlantıyı tek bir yerde oluşturup her yerden bunu kullanıyoruz.
 * Adres ve anahtar koda yazılmıyor; .env.local'dan (ortam değişkenleri) okunuyor.
 *
 * Bu bağlantı "anon" rolüyle çalışır: sadece RLS'nin ziyaretçiye
 * izin verdiklerini görebilir. Salon sahibinin paneli için oturum (cookie) bilen
 * ayrı bağlantı: supabaseServer.ts
 */
import { createClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "./supabaseEnv";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  // Sunucuda kullanıcı oturumu tutmuyoruz (ziyaretçi bağlantısı)
  auth: { persistSession: false },
});
