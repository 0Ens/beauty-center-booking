import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllServicesForAdmin } from "@/data/adminServices";
import { requireAdmin } from "@/lib/adminAuth";
import AdminNav from "../../AdminNav";
import ServiceForm from "../ServiceForm";
import { categoriesOf, toFormValues } from "../formValues";

export const metadata: Metadata = { title: "İşlemi düzenle" };

// params URL'ye bağlı → Suspense içinde bekleniyor (sayfa kabuğu hemen gösterilir)
export default function EditServicePage({ params }: PageProps<"/admin/islemler/[id]">) {
  return (
    <Suspense fallback={<p className="text-ink-soft">Yükleniyor…</p>}>
      <EditServiceContent params={params} />
    </Suspense>
  );
}

async function EditServiceContent({ params }: Pick<PageProps<"/admin/islemler/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  // Tüm listeyi zaten kategori önerileri için okuyoruz; işlemi de içinden buluyoruz
  const services = await getAllServicesForAdmin();
  const service = services.find((s) => String(s.id) === id);
  if (!service) notFound();

  return (
    <div className="space-y-8">
      <AdminNav />
      <header className="space-y-1">
        <h1 className="font-serif text-3xl font-semibold">{service.name}</h1>
        {!service.isActive && (
          <p className="text-sm text-ink-soft">Bu işlem pasif: sitede görünmüyor. Listeden tekrar yayınlayabilirsiniz.</p>
        )}
      </header>
      <ServiceForm id={service.id} slug={service.slug} initial={toFormValues(service)} categories={categoriesOf(services)} />
    </div>
  );
}
