import Link from "next/link";
import BeforeAfterCard from "../BeforeAfterCard";
import { getBeforeAfterEntries } from "@/data/beforeAfter";
import { pickHomeFeatured } from "@/lib/homeFeatured";

export default async function BeforeAfterTeaser() {
  /* Ana sayfa vitrini: kural lib/homeFeatured.ts'te (panel de aynısını kullanıyor) */
  const featured = pickHomeFeatured(await getBeforeAfterEntries());

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
