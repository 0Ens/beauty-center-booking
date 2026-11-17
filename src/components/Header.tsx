"use client";
/*
 * "use client" neden gerekli?
 * Next.js'te bileşenler varsayılan olarak SUNUCUDA çalışır (Server Component).
 * Bu bileşen ise tarayıcıya özgü şeyler kullanıyor:
 *  - useState: menünün açık/kapalı durumu, sayfanın kaydırılıp kaydırılmadığı
 *  - window.scrollY: sayfanın ne kadar kaydırıldığı
 *  - usePathname: hangi sayfada olduğumuz (aktif menü linkini vurgulamak için)
 * Bu yüzden onu "Client Component" olarak işaretliyoruz.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { navLinks } from "@/lib/site";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const y = window.scrollY;
      // Histerezis: küçülmek için 80px, büyümek için 10px eşiği.
      // Tek bir eşik olsaydı başlık küçülünce sayfa yüksekliği değişir,
      // scrollY eşiğin altına düşer ve başlık titreyerek büyüyüp küçülürdü.
      setScrolled((wasScrolled) => (wasScrolled ? y > 10 : y > 80));
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Temizlik (cleanup): bileşen ekrandan kalkınca dinleyiciyi kaldır.
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-blush-200 bg-linear-to-b from-blush-50 to-blush-200/95 backdrop-blur">
      <div className="container-page">
        {/* Logo satırı: 3 sütunlu grid → [boş] [logo] [menü butonu].
            Yan sütunlar eşit (1fr) olduğu için logo her ekranda tam ortada kalır. */}
        <div
          className={`grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-300 ${
            scrolled ? "py-2" : "py-3 md:py-5"
          }`}
        >
          <span />
          <Link href="/" aria-label="Demo Güzellik Merkezi — Ana sayfa" onClick={closeMenu}>
            <Logo compact={scrolled} eager />
          </Link>

          <button
            type="button"
            className="justify-self-end rounded-full p-2 text-ink transition-colors hover:bg-blush-200 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Masaüstü menüsü: 3 sütunlu grid → [boş] [linkler ortada] [buton sağda] */}
        <nav aria-label="Ana menü" className="hidden grid-cols-[1fr_auto_1fr] items-center pb-3 md:grid">
          <span />
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`relative py-1 text-sm tracking-wide transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-center after:bg-brand-700 after:transition-transform ${
                    isActive(link.href)
                      ? "text-brand-700 after:scale-x-100"
                      : "text-ink hover:text-brand-700 after:scale-x-0 hover:after:scale-x-100"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/rezervasyon" className="btn-primary justify-self-end">
            Randevu Al
          </Link>
        </nav>
      </div>

      {/* Mobil menü: sadece menuOpen true iken ekrana basılır */}
      {menuOpen && (
        <nav id="mobile-menu" aria-label="Mobil menü" className="border-t border-blush-200 bg-white md:hidden">
          <ul className="container-page flex flex-col py-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`block border-b border-blush-100 py-3 ${
                    isActive(link.href) ? "font-medium text-brand-700" : "text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="py-4">
              <Link href="/rezervasyon" onClick={closeMenu} className="btn-primary w-full">
                Randevu Al
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
