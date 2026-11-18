import Image from "next/image";
import Link from "next/link";
import { CalendarHeart } from "lucide-react";
import logoMark from "../../../public/logo-mark.svg";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-blush-200 to-blush-50">
      {/* Dekoratif yumuşak daireler (fotoğraf gelene kadar görsel boşluğu dolduruyor) */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-blush-300/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-1/3 -left-40 size-80 rounded-full bg-gold/15 blur-3xl" />

      <div className="container-page relative grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div className="text-center md:text-left">
          <p className="eyebrow">Demo Güzellik Merkezi</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] font-semibold sm:text-6xl">
            Cildinizin hak ettiği <span className="font-script text-[1.3em] font-normal text-brand-700">özen</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md leading-relaxed text-ink-soft md:mx-0">
            Cilt tipinize ve ihtiyacınıza özel bakımlarla kendinizi iyi hissetmeniz için buradayız.
            Randevunuzu birkaç adımda online oluşturabilirsiniz.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
            <Link href="/rezervasyon" className="btn-primary">
              <CalendarHeart size={18} aria-hidden /> Randevu Al
            </Link>
            <Link href="/islemlerimiz" className="btn-secondary">
              İşlemlerimizi İnceleyin
            </Link>
          </div>
        </div>

        {/* TODO: Salon ya da uygulama fotoğrafı gelince bu kutu fotoğrafla değişecek */}
        <div aria-hidden className="relative mx-auto aspect-[4/5] w-full max-w-sm">
          <div className="absolute inset-0 rotate-6 rounded-[3rem] bg-blush-300/50" />
          <div className="absolute inset-0 flex items-center justify-center rounded-[3rem] border border-white bg-linear-to-br from-white via-blush-100 to-blush-300 shadow-xl">
            {/* Mobilde ekrandaki en büyük öğe bu (LCP): lazy yüklenmesin, öncelikli insin.
                SVG olduğu için her boyutta keskin; "sizes" gerekmiyor (Next SVG'yi olduğu gibi sunar). */}
            <Image
              src={logoMark}
              alt=""
              loading="eager"
              fetchPriority="high"
              className="h-auto w-3/4"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
