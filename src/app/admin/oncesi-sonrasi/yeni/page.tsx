import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllBeforeAfterForAdmin } from "@/data/adminBeforeAfter";
import { getAllServicesForAdmin } from "@/data/adminServices";
import { requireAdmin } from "@/lib/adminAuth";
import { nowInIstanbul } from "@/lib/istanbulTime";
import AdminNav from "../../AdminNav";
import BeforeAfterForm from "../BeforeAfterForm";

export const metadata: Metadata = { title: "Yeni öncesi/sonrası" };

export default function NewBeforeAfterPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Yükleniyor…</p>}>
      <NewBeforeAfterContent />
    </Suspense>
  );
}

async function NewBeforeAfterContent() {
  await requireAdmin();
  // İki sorgu birbirini beklemesin: aynı anda başlat
  const [services, entries] = await Promise.all([getAllServicesForAdmin(), getAllBeforeAfterForAdmin()]);
  const today = nowInIstanbul().date;
  /*
   * Yeni örnek EN BAŞA gelsin (en yeni sonuç ana sayfada görünsün).
   * En küçük sıra − 1; ama 0'ın altına inmez (form 0–999 kabul ediyor).
   * İkisi de 0'da kalırsa sorgu "sıra eşitse yeni önce" dediği için yine yeni öne geçer.
   * Hiç örnek yoksa 10: önüne eklemek için yer kalsın.
   * (Math.min(...[]) = Infinity olduğu için boş liste ayrıca kontrol ediliyor.)
   */
  const nextSortOrder =
    entries.length === 0 ? 10 : Math.max(0, Math.min(...entries.map((e) => e.sortOrder)) - 1);

  return (
    <div className="space-y-8">
      <AdminNav />
      <h1 className="font-serif text-3xl font-semibold">Yeni öncesi/sonrası</h1>
      <BeforeAfterForm
        services={services.map((s) => ({ id: s.id, name: s.name, isActive: s.isActive }))}
        today={today}
        initial={{ serviceId: "", title: "", description: "", takenOn: today, featured: false, sortOrder: String(nextSortOrder) }}
      />
    </div>
  );
}
