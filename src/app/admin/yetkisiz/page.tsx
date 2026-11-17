import type { Metadata } from "next";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Yetki Yok" };

/*
 * Giriş yapmış ama admins tablosunda OLMAYAN biri buraya düşer.
 * (Giriş formu böyle birini zaten içeri almıyor; bu sayfa ikinci kilit.)
 * Giriş sayfasına yönlendirmiyoruz: proxy "giriş yapmışsın" diye panele
 * geri gönderirdi → sonsuz döngü. Bunun yerine çıkış yapma imkânı veriyoruz.
 */
export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-sm space-y-4 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <h1 className="font-serif text-3xl font-semibold">Yetki yok</h1>
      <p className="text-sm text-ink-soft">Bu hesabın yönetim paneline erişim yetkisi bulunmuyor.</p>
      <form action={signOut}>
        <button type="submit" className="btn-secondary">
          Çıkış Yap
        </button>
      </form>
    </div>
  );
}
