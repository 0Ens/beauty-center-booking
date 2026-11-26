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
import { isDemo } from "@/lib/siteMode";
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

  return signInAs(parsed.data.email, parsed.data.password, email);
}

/*
 * "DEMO OLARAK GİR" (sadece SITE_MODE=demo)
 *
 * Ziyaretçi şifre yazmaz: sunucu, ortam değişkenlerindeki ortak demo hesabıyla
 * giriş yapar. Şifre tarayıcıya hiç gitmez; sayfa kaynağında da görünmez.
 * Bu hesabın neleri yapamadığı: src/lib/demoAdmin.ts ve supabase/demo/demo_admin.sql
 */
export async function signInDemo(): Promise<LoginState> {
  // Bu fonksiyon da internete açık bir kapı: gerçek sitede çağrılırsa hiçbir şey yapmasın
  if (!isDemo) return { error: "Demo girişi bu sitede kapalı." };

  const email = process.env.DEMO_ADMIN_EMAIL?.trim();
  const password = process.env.DEMO_ADMIN_PASSWORD;
  if (!email || !password) {
    console.error("[panel] DEMO_ADMIN_EMAIL / DEMO_ADMIN_PASSWORD ortam değişkenleri eksik");
    return { error: "Demo hesabı şu an kullanılamıyor." };
  }

  // Hata olursa formdaki e-posta kutusuna demo adresini yazmıyoruz ("" geri gönder)
  return signInAs(email, password, "");
}

/** Ortak giriş adımı: Supabase'e sor, sonra admin mi diye bak. Başarılıysa panele yönlendirir. */
async function signInAs(email: string, password: string, echoEmail: string): Promise<LoginState> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Supabase çok sık denemeyi kendisi engelliyor (429)
    if (error.status === 429) {
      return { error: "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar deneyin.", email: echoEmail };
    }
    // "Bu e-posta kayıtlı değil" ya da "şifre yanlış" diye AYIRMIYORUZ:
    // ayırsaydık, deneyen biri hangi adreslerin hesabı olduğunu öğrenirdi.
    return { error: "E-posta ya da şifre hatalı.", email: echoEmail };
  }

  // Şifre doğru ama bu kişi admin mi? Değilse oturumu hemen kapat.
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "Bu hesabın panele giriş yetkisi yok.", email: echoEmail };
  }

  redirect(ADMIN_HOME);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(LOGIN_PATH);
}
