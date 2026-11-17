import Link from "next/link";
import ServiceCard from "@/components/ServiceCard";
import { featuredServices } from "@/data/services";

export default function FeaturedServices() {
  return (
    <section className="container-page py-20">
      <div className="mb-12 text-center">
        <p className="eyebrow">Hizmetlerimiz</p>
        <h2 className="heading-section mt-3">Öne Çıkan İşlemlerimiz</h2>
      </div>

      {/* Mobilde 1, tablette 2, masaüstünde 3 sütun → "responsive" grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredServices.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/islemlerimiz" className="btn-secondary">
          Tüm İşlemleri Gör
        </Link>
      </div>
    </section>
  );
}
