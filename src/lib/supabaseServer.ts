/*
 * OTURUMLU SUPABASE BAĞLANTISI (yönetim paneli için)
 *
 * Yönetici giriş yaptığında Supabase bir "oturum" verir; bunu tarayıcıda
 * ÇEREZ (cookie) olarak saklıyoruz. Her istekte çerez sunucuya gelir, bu
 * bağlantı onu okur ve Supabase'e "bu istek yöneticiden" der. RLS de buna
 * göre randevuları gösterir (is_admin()).
 *
 * Her istek için YENİ bağlantı oluşturulmalı: paylaşılırsa bir kişinin
 * oturumu başka birinin isteğine karışabilir.
 */
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseKey, supabaseUrl } from "./supabaseEnv";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Sayfa (Server Component) içinden çağrıldıysa çerez YAZILAMAZ
          // (sayfa gönderilmeye başlamıştır). Sorun değil: süresi dolan
          // oturumu proxy.ts her istekte zaten yeniliyor.
        }
      },
    },
  });
}
