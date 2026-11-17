"use client";
/*
 * Panel sayfalarının üstündeki menü + Çıkış Yap.
 * Layout'a değil sayfalara konuyor: giriş sayfasında görünmesin diye.
 * usePathname → hangi sayfadayız? (o sekme vurgulanır) → client bileşen
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "./actions";

const links = [
  { href: "/admin", label: "Randevular" },
  { href: "/admin/izin-gunleri", label: "İzin günleri" },
  { href: "/admin/calisma-saatleri", label: "Çalışma saatleri" },
  { href: "/admin/islemler", label: "İşlemler" },
  { href: "/admin/oncesi-sonrasi", label: "Öncesi/Sonrası" },
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-blush-200 pb-4">
      <ul className="flex flex-wrap gap-2">
        {links.map((l) => {
          // /admin/islemler/5 de "İşlemler" sekmesini vurgulasın; /admin ise sadece kendisi
          const active = l.href === "/admin" ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`inline-block rounded-full px-4 py-2 text-sm font-medium ${
                  active ? "bg-brand-700 text-white" : "text-brand-700 hover:bg-blush-100"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <form action={signOut}>
        <button type="submit" className="text-sm text-ink-soft underline hover:text-ink">
          Çıkış Yap
        </button>
      </form>
    </nav>
  );
}
