import Link from "next/link";
import { CalendarHeart, Home, type LucideIcon } from "lucide-react";

type Props = {
  title?: string;
  message?: string;
  /** İkinci düğme: varsayılan "Online Randevu" */
  secondary?: { href: string; label: string; icon: LucideIcon };
};

/*
 * "SAYFA BULUNAMADI" İÇERİĞİ
 *
 * Hem kök 404 sayfası (app/not-found.tsx) hem de işlem detayındaki
 * özel 404 (islemlerimiz/[slug]/not-found.tsx) bunu kullanıyor; sadece
 * başlık ve açıklama değişiyor.
 *
 * Hedef: ziyaretçiyi kaybetmemek. Hata ekranı yerine iki net yol:
 * ana sayfa ve randevu.
 */
export default function NotFoundContent({
  title = "Aradığınız sayfa bulunamadı",
  message = "Adres yanlış yazılmış ya da sayfa kaldırılmış olabilir.",
  secondary = { href: "/rezervasyon", label: "Online Randevu Al", icon: CalendarHeart },
}: Props) {
  // JSX'te bileşen adı büyük harfle başlamalı; o yüzden önce bir değişkene alıyoruz
  const SecondaryIcon = secondary.icon;
  return (
    <section className="container-page flex flex-col items-center py-20 text-center sm:py-28">
      {/* Dekoratif büyük 404: ekran okuyucu bunu okumasın, başlık zaten anlatıyor */}
      <p aria-hidden className="font-script text-8xl leading-none text-brand-400 sm:text-9xl">
        404
      </p>
      <h1 className="heading-section mt-6">{title}</h1>
      <p className="mt-4 max-w-md text-ink-soft">{message}</p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-primary">
          <Home size={18} aria-hidden /> Ana Sayfaya Dön
        </Link>
        <Link href={secondary.href} className="btn-secondary">
          <SecondaryIcon size={18} aria-hidden /> {secondary.label}
        </Link>
      </div>
    </section>
  );
}
