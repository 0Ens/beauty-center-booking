import Link from "next/link";
import { CalendarHeart } from "lucide-react";

/** Sayfa sonlarında "Randevu alın" çağrısı yapan pembe bant */
export default function CtaBand() {
  return (
    <section className="container-page">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-brand-700 to-brand-800 px-6 py-14 text-center text-white sm:px-12">
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-10 size-64 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-10 size-56 rounded-full bg-white/10" />
        <h2 className="relative font-serif text-3xl font-semibold sm:text-4xl">Kendinize bir iyilik yapın</h2>
        <p className="relative mx-auto mt-4 max-w-lg text-white/85">
          Size uygun gün ve saati seçin, randevunuzu dakikalar içinde oluşturun.
        </p>
        <Link
          href="/rezervasyon"
          className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-brand-800 shadow transition-colors hover:bg-blush-100"
        >
          <CalendarHeart size={18} aria-hidden /> Online Randevu Al
        </Link>
      </div>
    </section>
  );
}
