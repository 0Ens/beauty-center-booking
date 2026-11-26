import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/lib/site";
import { isDemo } from "@/lib/siteMode";

/*
 * Panelin kendi düzeni: sitenin menüsü, footer'ı ve WhatsApp balonu yok.
 * (Ziyaretçi sayfaları (site) grubundaki layout'u kullanıyor.)
 */
export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s | Yönetim Paneli" },
  // Panel Google'da asla çıkmamalı
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-blush-200 bg-white/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-script text-3xl text-brand-700">
            {site.logo.title}
          </Link>
          <span className="text-xs tracking-widest text-ink-soft uppercase">Yönetim Paneli</span>
        </div>
      </header>
      {isDemo && (
        <div role="note" className="bg-ink px-4 py-2 text-center text-sm text-white">
          <strong className="font-semibold">Demo panel:</strong> Randevuları onaylayıp iptal edebilirsiniz. Diğer
          ayarlar demo hesabında yalnızca görüntülenir. Veriler her gece sıfırlanır.
        </div>
      )}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
