"use server";
/*
 * GİRİŞ / ÇIKIŞ (Server Actions)
 *
 * Şifre tarayıcıdan bizim sunucumuza, oradan Supabase'e gider; hiçbir yere
 * kaydedilmez, log'a yazılmaz, forma geri gönderilmez.
 * Giriş başarılı olunca Supabase'in oturum çerezi tarayıcıya yazılır
 * (supabaseServer.ts → setAll). Server Action çerez yazabilir, sayfa yazamaz.
 */
import { redirect } from "next/navigation";
import { z } from "zod";
import { ADMIN_HOME, LOGIN_PATH } from "@/lib/adminRedirect";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export type LoginState = { error?: string; email?: string };

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const rawEmail = formData.get("email");
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";

  const parsed = schema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { error: "E-posta adresinizi ve şifrenizi yazın.", email };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Supabase çok sık denemeyi kendisi engelliyor (429)
    if (error.status === 429) {
      return { error: "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar deneyin.", email };
    }
    // "Bu e-posta kayıtlı değil" ya da "şifre yanlış" diye AYIRMIYORUZ:
    // ayırsaydık, deneyen biri hangi adreslerin hesabı olduğunu öğrenirdi.
    return { error: "E-posta ya da şifre hatalı.", email };
  }

  // Şifre doğru ama bu kişi admin mi? Değilse oturumu hemen kapat.
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "Bu hesabın panele giriş yetkisi yok.", email };
  }

  redirect(ADMIN_HOME);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(LOGIN_PATH);
}
