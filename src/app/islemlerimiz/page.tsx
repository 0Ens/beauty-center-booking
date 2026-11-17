import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ServiceCard from "@/components/ServiceCard";
import CtaBand from "@/components/CtaBand";
import { getServices } from "@/data/services";

export const metadata: Metadata = {
  title: "İşlemlerimiz",
  description: "Cilt bakımı, kaş ve kirpik uygulamaları: tüm işlemlerimiz, süreleri ve detayları.",
};

export default async function ServicesPage() {
  const services = await getServices();
  // Set: tekrar edenleri atar → her kategori bir kez
  const serviceCategories = [...new Set(services.map((service) => service.category))];

  return (
    <>
      <PageHeader
        title="İşlemlerimiz"
        description="Cildinizin ihtiyacına göre seçebileceğiniz bakım ve uygulamalarımız."
      />

      {/* Her kategori için ayrı bir bölüm: kategori adını yaz, o kategorideki işlemleri listele */}
      {serviceCategories.map((category) => (
        <section key={category} className="container-page py-12">
          <h2 className="heading-section mb-8 text-center sm:text-left">{category}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services
              .filter((service) => service.category === category)
              .map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
          </div>
        </section>
      ))}

      <div className="mt-12">
        <CtaBand />
      </div>
    </>
  );
}
