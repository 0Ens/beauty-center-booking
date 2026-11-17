import Link from "next/link";

/*
 * GEÇİCİ: Aşama 2'de bu bölüme sürüklenebilir öncesi/sonrası kaydırıcısı gelecek.
 */
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-blush-300 bg-blush-50"
            >
              <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow" />
              <span className="relative rounded-full bg-white px-4 py-2 text-xs text-ink-soft shadow">
                Kaydırıcı · Aşama 2
              </span>
            </div>
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
