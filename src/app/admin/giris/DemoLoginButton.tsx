"use client";
import { useActionState } from "react";
import { signInDemo, type LoginState } from "../actions";

const initialState: LoginState = {};

/** Sadece demo modunda gösterilir (page.tsx karar verir). Form boş: e-posta/şifreyi sunucu ekler. */
export default function DemoLoginButton() {
  const [state, formAction, pending] = useActionState(signInDemo, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error && (
        <p role="alert" className="rounded-2xl border border-brand-400 bg-blush-100 px-5 py-4 text-sm font-medium">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3 disabled:opacity-60">
        {pending ? "Giriş yapılıyor…" : "Demo olarak gir"}
      </button>
    </form>
  );
}
