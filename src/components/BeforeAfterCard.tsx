import BeforeAfterSlider from "./BeforeAfterSlider";
import { formatMonth } from "@/lib/format";
import type { BeforeAfterEntry } from "@/data/beforeAfter";

/*
 * Kaydırıcı + altında başlık, kategori · tarih ve açıklama.
 * Kendisinde state yok; sunucuda da tarayıcıda da çalışabilir.
 * Galeri ("use client") içinden çağrıldığında tarayıcıda çalışır, bu yüzden
 * sadece hazır veri alıyor (kategori sunucuda hesaplanmış geliyor).
 * Not: "import type" derlemede silinir → veritabanı kodu tarayıcıya taşınmaz.
 */
type Props = {
  item: BeforeAfterEntry;
  /** Başlık seviyesi: ana sayfada bölüm başlığının (h2) altında h3,
   *  galeri sayfasında doğrudan sayfa başlığının (h1) altında h2 */
  headingLevel?: "h2" | "h3";
  eager?: boolean;
};

export default function BeforeAfterCard({ item, headingLevel = "h3", eager = false }: Props) {
  // JSX'te etiket adı değişkenden gelecekse büyük harfli bir değişkene alınır
  const Heading = headingLevel;
  return (
    <article>
      <BeforeAfterSlider before={item.before} after={item.after} alt={item.title} eager={eager} />
      <div className="mt-4 px-1">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-700">
          {item.category} · {formatMonth(item.takenOn)}
        </p>
        <Heading className="mt-1 font-serif text-2xl font-semibold text-ink">{item.title}</Heading>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.description}</p>
      </div>
    </article>
  );
}
