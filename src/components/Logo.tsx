import Image from "next/image";
import { site } from "@/lib/site";
import logoMark from "../../public/logo-mark.svg";

/*
 * LOGO = amblem (çizim) + yazı (site.logo.title / site.logo.subtitle)
 *
 * Neden ikisi birlikte? Amblem ince çizgili bir çizim; küçük boyutta tek
 * başına "kimin logosu" olduğu anlaşılmıyor. Yanına marka adını yazınca
 * hem zarif hem okunaklı oluyor.
 *
 * logo-mark.svg: SVG bir resim değil, çizim tarifi: her boyutta keskin,
 * dosyası da küçük. Yeni salonda bu dosya salonun amblemiyle değiştirilir.
 * Resmi `import` ile almak, Next.js'e genişlik/yüksekliği otomatik söyler
 * (sayfa yüklenirken içerik zıplamaz = CLS olmaz).
 */
type LogoProps = {
  /** Sayfanın en üstündeki logo → hemen yüklensin (lazy değil) */
  eager?: boolean;
};

export default function Logo({ eager = false }: LogoProps) {
  return (
    /*
     * Boyutlar globals.css'teki logo-* sınıflarından geliyor. Header içindeyken
     * --shrink değişkenine göre kaydırmayla birlikte küçülüyor.
     * Masaüstünde logo HER ZAMAN alt alta (flex-col): flex-direction yumuşakça
     * değişemez, bir anda zıplar. Bu yüzden yalnızca boyutları değiştiriyoruz.
     */
    <span className="logo-stack flex items-center leading-none md:flex-col">
      <Image
        src={logoMark}
        alt=""
        loading={eager ? "eager" : "lazy"}
        className="logo-mark h-auto"
      />
      <span className="flex flex-col items-center">
        {/* El yazısı fontların harfleri küçük görünür, bu yüzden boyutu serif'e göre büyük tuttuk */}
        <span className="logo-title font-script text-brand-700">{site.logo.title}</span>
        <span className="logo-subtitle mt-1 pl-[0.4em] font-medium uppercase tracking-[0.4em] text-brand-800">
          {site.logo.subtitle}
        </span>
      </span>
    </span>
  );
}
