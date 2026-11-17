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
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { navLinks } from "@/lib/site";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // useRef: React'in çizdiği <header> DOM elemanına doğrudan erişim
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    /*
     * HATA DERSİ — başlık neden titriyordu?
     * Eskiden header "sticky" idi, yani sayfa akışında yer kaplıyordu.
     * Küçülünce (229px → 110px) altındaki tüm içerik ~120px yukarı kayıyordu.
     * Tarayıcının "scroll anchoring" özelliği, ekrandaki içerik yerinden
     * oynamasın diye scrollY'yi de ~120px azaltıyordu → scrollY eşiğin altına
     * düşüyor → başlık büyüyor → içerik aşağı kayıyor → scrollY artıyor →
     * başlık küçülüyor... Sonsuz döngü.
     *
     * Çözüm (kural): header'ın YÜKSEKLİĞİ hiç değişmesin. Sayfa uzunluğu
     * sabit kalınca scroll anchoring'in düzelteceği bir şey kalmaz.
     *
     * HATA DERSİ 2 — "fixed header + yer tutucu" neden yetmedi?
     * Tarayıcı kaydırmayı JavaScript'ten AYRI bir iş parçacığında
     * (compositor) yapar: içerik anında kayar, bizim scroll dinleyicimiz ise
     * bir-iki kare SONRA çalışır. JS ile konumlanan header hep bir kare
     * geriden geliyordu → hızlı yukarı kaydırınca altındaki yer tutucu
     * görünüyor, hareket de takılıyordu.
     *
     * Asıl çözüm: header'ı tarayıcının kendisi hareket ettirsin →
     * position: sticky + negatif top (globals.css → .site-header).
     * JavaScript artık sadece logonun boyutunu ayarlıyor; o bir kare gecikse
     * bile gözle görülmez, çünkü header kutusu zaten doğru yerde.
     *
     *   shrink = scrollY / mesafe   (0 ile 1 arasına sıkıştırılmış)
     *   mesafe = büyük satır yüksekliği − küçük satır yüksekliği
     *
     * Neden useState değil? Kaydırma saniyede ~60 kez tetiklenir. Her seferinde
     * state değiştirmek tüm header'ı 60 kez yeniden render eder. Bunun yerine
     * tek bir CSS değişkenini (--shrink) doğrudan DOM'a yazıyoruz; gerisini
     * tarayıcı CSS ile hallediyor (globals.css → .header-row, .logo-*).
     */
    let distance = 1;
    function measure() {
      // Değerleri globals.css'ten okuyoruz → tek kaynak, ekran boyutuna göre doğru
      const root = getComputedStyle(document.documentElement);
      const rem = parseFloat(root.fontSize);
      const px = (name: string) => parseFloat(root.getPropertyValue(name)) * rem;
      distance = Math.max(px("--header-row") - px("--header-row-compact"), 1); // 0'a bölmeyi önle
    }
    function handleScroll() {
      const shrink = Math.min(Math.max(window.scrollY / distance, 0), 1);
      headerRef.current?.style.setProperty("--shrink", shrink.toFixed(3));
    }
    function handleResize() {
      measure(); // mobil ↔ masaüstü geçişinde eşik değişir
      handleScroll();
    }
    handleResize(); // Sayfa ortadan yenilenirse (F5) başlık doğru hâlde başlasın
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    // Temizlik (cleanup): bileşen ekrandan kalkınca dinleyicileri kaldır.
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      ref={headerRef}
      className="site-header z-40 border-b border-blush-200 bg-linear-to-b from-blush-50 to-blush-200"
    >
      <div className="container-page">
        {/* Logo satırı: yüksekliği sabit (--header-row). İçindeki grid satırın
            altına yaslı ve sadece ekranda görünen kısım kadar yüksek. */}
        <div className="flex h-(--header-row) flex-col justify-end">
          {/* 3 sütunlu grid → [boş] [logo] [menü butonu].
              Yan sütunlar eşit (1fr) olduğu için logo her ekranda tam ortada kalır. */}
          <div className="header-row grid grid-cols-[1fr_auto_1fr] items-center">
            <span />
            <Link href="/" aria-label="Demo Güzellik Merkezi — Ana sayfa" onClick={closeMenu}>
              <Logo eager />
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
        </div>

        {/* Masaüstü menüsü: 3 sütunlu grid → [boş] [linkler ortada] [buton sağda] */}
        <nav aria-label="Ana menü" className="hidden h-(--header-nav) grid-cols-[1fr_auto_1fr] items-center pb-3 md:grid">
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
        // absolute: menü açılınca header uzamasın, sayfanın üstüne binsin
        <nav
          id="mobile-menu"
          aria-label="Mobil menü"
          className="absolute inset-x-0 top-full border-y border-blush-200 bg-white shadow-md md:hidden"
        >
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
