import BeforeAfterSlider from "./BeforeAfterSlider";
import { formatMonth, getCategory, type BeforeAfterItem } from "@/data/beforeAfter";

/*
 * Kaydırıcı + altında başlık, kategori · tarih ve açıklama.
 * Bu bileşen sunucuda çalışabilir (state yok); içindeki kaydırıcı ise
 * "use client" olduğu için tarayıcıda canlanır. Next.js ikisini birlikte
 * kullanmamıza izin veriyor.
 */
export default function BeforeAfterCard({ item }: { item: BeforeAfterItem }) {
  return (
    <article>
      <BeforeAfterSlider before={item.before} after={item.after} alt={item.title} />
      <div className="mt-4 px-1">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-600">
          {getCategory(item)} · {formatMonth(item.date)}
        </p>
        <h3 className="mt-1 font-serif text-2xl font-semibold text-ink">{item.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.description}</p>
      </div>
    </article>
  );
}
