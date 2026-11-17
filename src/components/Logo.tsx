import Image from "next/image";
import logoMark from "../../public/logo-mark-bold.png";

/*
 * LOGO = amblem (çizim) + yazı (Demo / Beauty Center)
 *
 * Neden ikisi birlikte? Amblem ince çizgili bir çizim; küçük boyutta tek
 * başına "kimin logosu" olduğu anlaşılmıyor. Yanına marka adını yazınca
 * hem zarif hem okunaklı oluyor.
 *
 * logo-mark.png, logo.png'nin kenarlarındaki boşluk kırpılmış hâli.
 * logo-mark-bold.png ise çizgileri kalınlaştırılmış sürümü: ince çizgiler
 * küçük boyutta kaybolduğu için başlık ve footer'da bunu kullanıyoruz.
 * Resmi `import` ile almak, Next.js'e genişlik/yüksekliği otomatik söyler
 * (sayfa yüklenirken içerik zıplamaz = CLS olmaz).
 */
type LogoProps = {
  /** Sayfa aşağı kaydırılınca logo küçülür ve yan yana dizilir */
  compact?: boolean;
  /** Sayfanın en üstündeki logo → hemen yüklensin (lazy değil) */
  eager?: boolean;
};

export default function Logo({ compact = false, eager = false }: LogoProps) {
  return (
    <span
      className={`flex items-center gap-3 leading-none ${compact ? "" : "md:flex-col md:gap-2"}`}
    >
      <Image
        src={logoMark}
        alt=""
        loading={eager ? "eager" : "lazy"}
        className={`h-auto transition-all duration-300 ${compact ? "w-10" : "w-12 md:w-20"}`}
        sizes="80px"
      />
      <span className="flex flex-col items-center">
        <span
          className={`font-serif font-semibold text-brand-800 transition-all duration-300 ${
            compact ? "text-2xl" : "text-[1.7rem] md:text-4xl"
          }`}
        >
          Demo
        </span>
        <span
          className={`mt-1 pl-[0.4em] uppercase tracking-[0.4em] text-ink-soft transition-all duration-300 ${
            compact ? "text-[0.5rem]" : "text-[0.55rem] md:text-[0.65rem]"
          }`}
        >
          Beauty Center
        </span>
      </span>
    </span>
  );
}
