import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import BeforeAfterCard from "@/components/BeforeAfterCard";
import { beforeAfterItems } from "@/data/beforeAfter";
import { serviceCategories } from "@/data/services";

export const metadata: Metadata = {
  title: "Öncesi & Sonrası",
  description: "Bakımlarımızın öncesi ve sonrası: gerçek müşteri sonuçlarını karşılaştırın.",
};

/*
 * GEÇİCİ: Kategori düğmeleri henüz çalışmıyor (sıradaki adım).
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

        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {beforeAfterItems.map((item) => (
            <BeforeAfterCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </>
  );
}
