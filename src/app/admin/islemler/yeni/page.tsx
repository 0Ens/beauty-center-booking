import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllServicesForAdmin } from "@/data/adminServices";
import { requireAdmin } from "@/lib/adminAuth";
import AdminNav from "../../AdminNav";
import ServiceForm from "../ServiceForm";
import { categoriesOf, emptyFormValues } from "../formValues";

export const metadata: Metadata = { title: "Yeni işlem" };

export default function NewServicePage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Yükleniyor…</p>}>
      <NewServiceContent />
    </Suspense>
  );
}

async function NewServiceContent() {
  await requireAdmin();
  const services = await getAllServicesForAdmin();
  const nextSortOrder = services.reduce((max, s) => Math.max(max, s.sortOrder), 0) + 1;

  return (
    <div className="space-y-8">
      <AdminNav />
      <h1 className="font-serif text-3xl font-semibold">Yeni işlem</h1>
      <ServiceForm initial={emptyFormValues(nextSortOrder)} categories={categoriesOf(services)} />
    </div>
  );
}
