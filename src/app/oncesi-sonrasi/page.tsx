import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import BeforeAfterGallery from "@/components/BeforeAfterGallery";
import { getBeforeAfterEntries } from "@/data/beforeAfter";
import { getServiceCategories } from "@/data/services";

export const metadata: Metadata = {
  title: "Öncesi & Sonrası",
  description: "Bakımlarımızın öncesi ve sonrası: gerçek müşteri sonuçlarını karşılaştırın.",
};

/*
 * Sayfa SUNUCU bileşeni (metadata için). Veriyi burada, sunucuda çekip
 * etkileşimli kısma (kategori düğmeleri + filtre, "use client" olan
 * BeforeAfterGallery) props olarak veriyoruz.
 * Promise.all: iki isteği SIRAYLA değil AYNI ANDA başlatır.
 */
export default async function BeforeAfterPage() {
  const [items, categories] = await Promise.all([getBeforeAfterEntries(), getServiceCategories()]);

  return (
    <>
      <PageHeader
        title="Öncesi & Sonrası"
        description="Ortadaki çizgiyi sürükleyerek sonuçları karşılaştırın."
      />

      <section className="container-page py-12">
        <BeforeAfterGallery items={items} categories={categories} />
      </section>
    </>
  );
}
