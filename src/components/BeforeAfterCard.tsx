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
export default function BeforeAfterCard({ item }: { item: BeforeAfterEntry }) {
  return (
    <article>
      <BeforeAfterSlider before={item.before} after={item.after} alt={item.title} />
      <div className="mt-4 px-1">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-600">
          {item.category} · {formatMonth(item.date)}
        </p>
        <h3 className="mt-1 font-serif text-2xl font-semibold text-ink">{item.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.description}</p>
      </div>
    </article>
  );
}
