import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";
import CurrentYear from "./CurrentYear";
import { navLinks, site } from "@/lib/site";
import { getHoursLines } from "@/data/workingHours";

// "use client" yok → bu bir Server Component. Sadece HTML üretir,
// tarayıcıya hiç JavaScript gönderilmez. Etkileşim yoksa varsayılan bu olmalı.
// async: çalışma saatleri veritabanından geliyor.
export default async function Footer() {
  const hours = await getHoursLines();

  return (
    <footer className="mt-24 border-t border-blush-200 bg-linear-to-b from-blush-100 to-blush-200/60">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
            Cildinize özel, güler yüzlü ve hijyenik bir ortamda profesyonel bakım.
          </p>
        </div>

        <div className="text-center md:text-left">
          <h2 className="mb-4 font-serif text-xl font-semibold">Sayfalar</h2>
          <ul className="space-y-2 text-sm">
            {[...navLinks, { href: "/rezervasyon", label: "Randevu Al" }].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-ink-soft transition-colors hover:text-brand-700">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center md:text-left">
          <h2 className="mb-4 font-serif text-xl font-semibold">İletişim</h2>
          <ul className="space-y-3 text-sm text-ink-soft">
            {site.address && (
              <li className="flex items-start justify-center gap-2 md:justify-start">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" aria-hidden />
                {site.mapsUrl ? (
                  <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-700">
                    {site.address}
                  </a>
                ) : (
                  site.address
                )}
              </li>
            )}
            {site.phone && (
              <li className="flex items-center justify-center gap-2 md:justify-start">
                <Phone size={16} className="shrink-0 text-brand-600" aria-hidden />
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-brand-700">
                  {site.phone}
                </a>
              </li>
            )}
            {hours.map((h) => (
              <li key={h.days} className="flex items-center justify-center gap-2 md:justify-start">
                <Clock size={16} className="shrink-0 text-brand-600" aria-hidden />
                <span>
                  {h.days}: <span className="text-ink">{h.time}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-blush-300/60 py-5 text-center text-xs text-ink-soft">
        © <CurrentYear /> {site.name}. Tüm hakları saklıdır. ·{" "}
        <Link href="/kvkk" className="underline hover:text-brand-700">
          KVKK Aydınlatma Metni
        </Link>
      </div>
    </footer>
  );
}
