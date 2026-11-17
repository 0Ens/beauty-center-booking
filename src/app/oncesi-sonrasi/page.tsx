import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { serviceCategories } from "@/data/services";

export const metadata: Metadata = {
  title: "Öncesi & Sonrası",
  description: "Bakımlarımızın öncesi ve sonrası: gerçek müşteri sonuçlarını karşılaştırın.",
};

/*
 * GEÇİCİ: Aşama 2'de kategori filtresi çalışır hale gelecek ve
 * kartların içine sürüklenebilir kaydırıcı eklenecek.
 */
export default function BeforeAfterPage() {
  return (
    <>
      <PageHeader
        title="Öncesi & Sonrası"
        description="Ortadaki çizgiyi sürükleyerek sonuçları karşılaştırın."
      />

      <section className="container-page py-12">
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {["Tümü", ...serviceCategories].map((category, i) => (
            <span
              key={category}
              className={`rounded-full px-5 py-2 text-sm ${
                i === 0 ? "bg-brand-700 text-white" : "border border-blush-300 bg-white text-ink"
              }`}
            >
              {category}
            </span>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex aspect-[4/5] items-center justify-center rounded-3xl border-2 border-dashed border-blush-300 bg-white text-xs text-ink-soft"
            >
              Kaydırıcı · Aşama 2
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
