/*
 * VERİ ERİŞİM KATMANI (DAL): "Bu isteği yapan kişi yönetici mi?"
 *
 * Panelin her sayfası ve her Server Action veriye dokunmadan ÖNCE
 * requireAdmin() çağırır. proxy.ts'deki kontrol sadece hızlı bir ön
 * kontroldür; asıl karar burada (ve veritabanında RLS ile) verilir.
 *
 * cache(): Aynı sayfa çiziminde birden fazla bileşen çağırsa bile
 * kontrol bir kez yapılır.
 */
import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { LOGIN_PATH } from "./adminRedirect";
import { isDemoAdminEmail } from "./demoAdmin";
import { isDemo } from "./siteMode";
import { createSupabaseServerClient } from "./supabaseServer";

export const UNAUTHORIZED_PATH = "/admin/yetkisiz";

export const requireAdmin = cache(async () => {
  // "Bu kontrol önceden hazırlanamaz, gerçek istek gelince yap."
  // Next sayfayı önceden çizmeye (prerender) çalışırken çerezleri de okuyabiliyor;
  // ama Supabase oturum süresini Date.now() ile kontrol ediyor ve saat her an
  // değiştiği için önceden hesaplanamaz → "unstable value Date.now()" hatası.
  // connection() önceden çizimi burada durdurur.
  await connection();
  const supabase = await createSupabaseServerClient();

  // getClaims oturum anahtarının imzasını doğrular (çerezdeki yazıya körü körüne güvenmez)
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect(LOGIN_PATH);

  // Giriş yapmış olmak yetmez: admins tablosunda olmalı (0009_admin.sql)
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error) throw new Error("Yetki kontrolü yapılamadı");
  if (isAdmin !== true) redirect(UNAUTHORIZED_PATH);

  const email = typeof data.claims.email === "string" ? data.claims.email : "";

  // Portföy demosundaki ortak hesap mı? (demoAdmin.ts) Öyleyse ayar kaydeden
  // Server Action'lar "Demoda kapalı" döner. Asıl kilit veritabanında (RLS).
  const isDemoAccount = isDemo && isDemoAdminEmail(email, process.env.DEMO_ADMIN_EMAIL);

  return { supabase, email, isDemoAccount };
});
