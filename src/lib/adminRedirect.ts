/*
 * /admin altındaki bir sayfaya gelen isteği nereye yönlendirelim?
 * proxy.ts her /admin isteğinde bunu çağırır.
 *
 * Saf fonksiyon (çerez, veritabanı yok) → adminRedirect.test.ts ile test ediliyor.
 */
export const LOGIN_PATH = "/admin/giris";
export const ADMIN_HOME = "/admin";

/** Yönlendirilecek adres; yönlendirme gerekmiyorsa null. */
export function adminRedirect(pathname: string, isLoggedIn: boolean): string | null {
  const isLoginPage = pathname === LOGIN_PATH;

  // 1) Giriş yapmamış biri panelin bir sayfasını açmaya çalışıyor → giriş sayfasına.
  //    !isLoginPage şart: yoksa giriş sayfası kendine yönlendirir → sonsuz döngü.
  if (!isLoggedIn && !isLoginPage) return LOGIN_PATH;
  // 2) Zaten giriş yapmış biri giriş sayfasını açıyor → panele
  if (isLoggedIn && isLoginPage) return ADMIN_HOME;

  return null;
}
