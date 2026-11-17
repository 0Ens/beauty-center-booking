import type { Metadata } from "next";
import { Clock, MapPin, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Instagram from "@/components/InstagramIcon";
import { site, whatsappLink } from "@/lib/site";
import { getHoursLines } from "@/data/workingHours";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Adres, telefon ve çalışma saatlerimiz.",
};

export default async function ContactPage() {
  const hours = await getHoursLines();
  const wa = whatsappLink();
  // Not: Bilgiler site.ts'ten geliyor. Boş olanlar ekranda "yakında eklenecek" olarak görünür.
  const missing = "Yakında eklenecek";

  const items = [
    {
      icon: MapPin,
      title: "Adres",
      // Adres yazılmamış ama harita linki varsa en azından haritaya yönlendir
      value: site.address || (site.mapsUrl ? "Haritada görüntüle" : missing),
      href: site.mapsUrl || undefined,
    },
    {
      icon: Phone,
      title: "Telefon",
      value: site.phone || missing,
      href: site.phone ? `tel:${site.phone.replace(/\s/g, "")}` : undefined,
    },
    {
      icon: Instagram,
      title: "Instagram",
      value: site.instagram ? `@${site.instagram}` : missing,
      href: site.instagram ? `https://instagram.com/${site.instagram}` : undefined,
    },
  ];

  return (
    <>
      <PageHeader title="İletişim" description="Sorularınız ve randevu için bize ulaşın." />

      <section className="container-page grid gap-6 py-12 md:grid-cols-2">
        {items.map(({ icon: Icon, title, value, href }) => (
          <div key={title} className="flex items-start gap-4 rounded-3xl border border-blush-200 bg-white p-6">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blush-100 text-brand-700">
              <Icon size={22} strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <h2 className="font-serif text-xl font-semibold">{title}</h2>
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-ink-soft hover:text-brand-700">
                  {value}
                </a>
              ) : (
                <p className="text-ink-soft">{value}</p>
              )}
            </div>
          </div>
        ))}

        <div className="flex items-start gap-4 rounded-3xl border border-blush-200 bg-white p-6">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blush-100 text-brand-700">
            <Clock size={22} strokeWidth={1.5} aria-hidden />
          </span>
          <div>
            <h2 className="font-serif text-xl font-semibold">Çalışma Saatleri</h2>
            <ul className="text-ink-soft">
              {hours.map((h) => (
                <li key={h.days}>
                  {h.days}: <span className="text-ink">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary md:col-span-2">
            WhatsApp ile Yazın
          </a>
        )}
        {/* Aşama 6'da: Google Haritalar gömülü harita */}
      </section>
    </>
  );
}
