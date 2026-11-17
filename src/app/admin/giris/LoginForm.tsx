"use client";
import { useActionState } from "react";
import { signIn, type LoginState } from "../actions";

const inputClass =
  "mt-1 w-full rounded-xl border border-blush-300 bg-white px-4 py-2.5 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/40";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p role="alert" className="rounded-2xl border border-brand-400 bg-blush-100 px-5 py-4 text-sm font-medium">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="text-sm font-medium">
          E-posta
        </label>
        {/* autoComplete="username": telefonun şifre yöneticisi bu alanı tanır */}
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Şifre
        </label>
        {/* Şifre hata sonrası geri doldurulmaz (defaultValue yok): sunucu onu hiç geri göndermez */}
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full py-3 disabled:opacity-60">
        {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
