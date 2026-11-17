import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import BeforeAfterGallery from "@/components/BeforeAfterGallery";

export const metadata: Metadata = {
  title: "Öncesi & Sonrası",
  description: "Bakımlarımızın öncesi ve sonrası: gerçek müşteri sonuçlarını karşılaştırın.",
};

/*
 * Sayfa SUNUCU bileşeni (metadata için). Etkileşimli kısım, yani kategori
 * düğmeleri ve filtrelenen liste, "use client" olan BeforeAfterGallery'de.
 */
export default function BeforeAfterPage() {
  return (
    <>
      <PageHeader
        title="Öncesi & Sonrası"
        description="Ortadaki çizgiyi sürükleyerek sonuçları karşılaştırın."
      />

      <section className="container-page py-12">
        <BeforeAfterGallery />
      </section>
    </>
  );
}
