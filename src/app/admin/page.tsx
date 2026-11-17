import { Suspense } from "react";
import { requireAdmin } from "@/lib/adminAuth";
import { signOut } from "./actions";

/*
 * Panel ana sayfası. Şimdilik sadece "giriş çalışıyor mu?" gösteriyor;
 * sıradaki adımda bekleyen randevular burada listelenecek.
 *
 * Oturum (çerez) her istekte okunur → sayfanın bu kısmı önceden
 * hazırlanamaz, <Suspense> içinde sonradan gelir (Cache Components kuralı).
 */
export default function AdminHomePage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Yükleniyor…</p>}>
      <Welcome />
    </Suspense>
  );
}

async function Welcome() {
  const { email } = await requireAdmin();

  return (
    <section className="space-y-4">
      <h1 className="font-serif text-3xl font-semibold">Hoş geldiniz</h1>
      <p className="text-sm text-ink-soft">Giriş yapan hesap: {email}</p>
      <p className="rounded-2xl bg-white p-5 text-sm shadow-sm">
        Bekleyen randevular burada listelenecek.
      </p>
      <form action={signOut}>
        <button type="submit" className="btn-secondary">
          Çıkış Yap
        </button>
      </form>
    </section>
  );
}
