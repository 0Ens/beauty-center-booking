import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Giriş" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <h1 className="font-serif text-3xl font-semibold">Panele Giriş</h1>
      <p className="mt-2 mb-6 text-sm text-ink-soft">Randevuları yönetmek için giriş yapın.</p>
      <LoginForm />
    </div>
  );
}
