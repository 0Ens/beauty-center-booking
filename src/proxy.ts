/*
 * PROXY: /admin altındaki her istekten ÖNCE çalışır (Next 16'da "middleware"in yeni adı).
 *
 * İki işi var:
 *  1) Oturumu tazelemek: Supabase oturumunun kısa ömürlü bir anahtarı var.
 *     Süresi dolmuşsa burada yenilenir ve yeni çerez tarayıcıya yazılır.
 *     (Sayfalar çerez yazamaz; bu yüzden bu iş burada.)
 *  2) Hızlı ön kontrol: giriş yoksa giriş sayfasına yönlendir.
 *
 * DİKKAT: Bu sadece ön kontrol ("kapıdaki görevli"). Asıl güvenlik
 * veriye yakın yerde: her panel sayfası ve Server Action requireAdmin()
 * çağırır, veritabanı da RLS ile (is_admin) ayrıca kontrol eder.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { adminRedirect } from "@/lib/adminRedirect";
import { supabaseKey, supabaseUrl } from "@/lib/supabaseEnv";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Yenilenen çerezi hem bu isteğe (sayfa yeni oturumu görsün)
        // hem de cevaba (tarayıcı saklasın) yazıyoruz.
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        // Oturum çerezi içeren cevaplar ara sunucularda önbelleğe ALINMAMALI
        // (yoksa bir kişinin oturumu başkasına gidebilir).
        cacheHeaders = headers;
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  // getClaims: çerezdeki oturumu doğrular, gerekirse yeniler
  const { data } = await supabase.auth.getClaims();
  const target = adminRedirect(request.nextUrl.pathname, Boolean(data?.claims));

  if (target) {
    const redirect = NextResponse.redirect(new URL(target, request.url));
    // Yenilenmiş çerezler yönlendirmede kaybolmasın
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    for (const [key, value] of Object.entries(cacheHeaders)) redirect.headers.set(key, value);
    return redirect;
  }

  return response;
}

export const config = {
  // Sadece panel: ziyaretçi sayfaları hiç etkilenmez (hızlı kalırlar)
  matcher: ["/admin/:path*"],
};
