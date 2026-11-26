import type { Metadata } from "next";
import { isDemo } from "@/lib/siteMode";
import DemoLoginButton from "./DemoLoginButton";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Giriş" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <h1 className="font-serif text-3xl font-semibold">Panele Giriş</h1>
      <p className="mt-2 mb-6 text-sm text-ink-soft">Randevuları yönetmek için giriş yapın.</p>

      {/* Portföy demosunda ziyaretçi şifresiz, ortak demo hesabıyla girer (demoAdmin.ts) */}
      {isDemo && (
        <div className="mb-6 space-y-3 border-b border-blush-200 pb-6">
          <DemoLoginButton />
          <p className="text-xs text-ink-soft">
            Şifre gerekmez. Randevuları onaylayıp iptal edebilirsiniz; işlem, çalışma saati, izin ve galeri
            ayarlarını inceleyebilir ama kaydedemezsiniz. Veriler her gece sıfırlanır.
          </p>
        </div>
      )}

      <LoginForm />
    </div>
  );
}
