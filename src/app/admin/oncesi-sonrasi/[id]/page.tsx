import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllBeforeAfterForAdmin } from "@/data/adminBeforeAfter";
import { getAllServicesForAdmin } from "@/data/adminServices";
import { requireAdmin } from "@/lib/adminAuth";
import { nowInIstanbul } from "@/lib/istanbulTime";
import AdminNav from "../../AdminNav";
import BeforeAfterForm, { DeleteBeforeAfter } from "../BeforeAfterForm";

export const metadata: Metadata = { title: "Öncesi/sonrası düzenle" };

// params URL'ye bağlı → Suspense içinde bekleniyor
export default function EditBeforeAfterPage({ params }: PageProps<"/admin/oncesi-sonrasi/[id]">) {
  return (
    <Suspense fallback={<p className="text-ink-soft">Yükleniyor…</p>}>
      <EditBeforeAfterContent params={params} />
    </Suspense>
  );
}

async function EditBeforeAfterContent({ params }: Pick<PageProps<"/admin/oncesi-sonrasi/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const [services, entries] = await Promise.all([getAllServicesForAdmin(), getAllBeforeAfterForAdmin()]);
  const entry = entries.find((e) => String(e.id) === id);
  if (!entry) notFound();

  return (
    <div className="space-y-8">
      <AdminNav />
      <h1 className="font-serif text-3xl font-semibold">{entry.title}</h1>
      <BeforeAfterForm
        id={entry.id}
        services={services.map((s) => ({ id: s.id, name: s.name, isActive: s.isActive }))}
        today={nowInIstanbul().date}
        photos={{ before: entry.before, after: entry.after }}
        initial={{
          serviceId: String(entry.serviceId),
          title: entry.title,
          description: entry.description,
          takenOn: entry.takenOn,
          featured: entry.featured,
          sortOrder: String(entry.sortOrder),
        }}
      />
      <section className="space-y-2 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Örneği sil</h2>
        <p className="text-sm text-ink-soft">
          Örnek siteden kalkar ve fotoğraflar sunucudan tamamen silinir. Müşteri rızasını geri çekerse bunu kullanın.
        </p>
        <DeleteBeforeAfter id={entry.id} />
      </section>
    </div>
  );
}
