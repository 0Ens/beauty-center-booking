import Link from "next/link";
import { Clock, Droplets, Eye, Flower2, Leaf, Sparkles, Sun, type LucideIcon } from "lucide-react";
import type { Service, ServiceIconName } from "@/data/services";

// Veride ikonları metin olarak ("droplets") tutuyoruz, çünkü veritabanına
// bir React bileşeni kaydedemeyiz. Burada metni ikon bileşenine çeviriyoruz.
const icons: Record<ServiceIconName, LucideIcon> = {
  droplets: Droplets,
  sparkles: Sparkles,
  leaf: Leaf,
  sun: Sun,
  flower: Flower2,
  eye: Eye,
};

export default function ServiceCard({ service }: { service: Service }) {
  const Icon = icons[service.icon];

  return (
    <Link
      href={`/islemlerimiz/${service.slug}`}
      // prefetch={true}: kart ekranda görününce detay sayfasının içeriği (slug'a özel kısım dahil)
      // önceden indirilir → tıklayınca sayfa anında açılır.
      prefetch={true}
      className="group flex flex-col items-center rounded-3xl border border-blush-200 bg-white p-8 text-center shadow-[0_10px_40px_-20px_rgba(163,83,106,0.35)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(163,83,106,0.45)]"
    >
      <span className="mb-5 flex size-16 items-center justify-center rounded-full bg-blush-100 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
        <Icon size={28} strokeWidth={1.5} aria-hidden />
      </span>
      <h3 className="font-serif text-2xl font-semibold">{service.name}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{service.summary}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-xs tracking-wide text-ink-soft">
        <Clock size={14} aria-hidden /> {service.durationMin} dk
      </span>
    </Link>
  );
}
