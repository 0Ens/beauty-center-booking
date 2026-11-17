import Link from "next/link";
import BeforeAfterCard from "../BeforeAfterCard";
import { beforeAfterItems } from "@/data/beforeAfter";

/* Ana sayfa vitrini: sadece "featured" işaretli ilk 3 örnek */
const featured = beforeAfterItems.filter((item) => item.featured).slice(0, 3);

export default function BeforeAfterTeaser() {
  return (
    <section className="bg-white py-20">
      <div className="container-page">
        <div className="mb-12 text-center">
          <p className="eyebrow">Sonuçlarımız</p>
          <h2 className="heading-section mt-3">Öncesi & Sonrası</h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-soft">
            Ortadaki çizgiyi sürükleyerek bakım öncesi ve sonrasını karşılaştırın.
          </p>
        </div>

        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item) => (
            <BeforeAfterCard key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/oncesi-sonrasi" className="btn-secondary">
            Tüm Sonuçları Gör
          </Link>
        </div>
      </div>
    </section>
  );
}
