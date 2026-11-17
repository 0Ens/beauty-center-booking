import type { Metadata } from "next";
import { Suspense } from "react";
import { getWorkingHoursRows } from "@/data/workingHours";
import { requireAdmin } from "@/lib/adminAuth";
import AdminNav from "../AdminNav";
import HoursForm from "./HoursForm";

export const metadata: Metadata = { title: "Çalışma saatleri" };

/*
 * ÇALIŞMA SAATLERİ: haftanın her günü için açılış/kapanış ya da "kapalı".
 * Buradaki saatler rezervasyon takvimini, iletişim sayfasını ve footer'ı besler.
 * (Tek seferlik kapanışlar için "İzin günleri" sayfası var.)
 */
export default function HoursPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Yükleniyor…</p>}>
      <HoursContent />
    </Suspense>
  );
}

async function HoursContent() {
  await requireAdmin();
  // Ziyaretçi tarafıyla aynı (önbellekli) okuma; kaydedince updateTag ile tazelenir
  const rows = await getWorkingHoursRows();
  const initial = rows.map((r) => ({
    weekday: r.weekday,
    closed: r.is_closed,
    open: (r.open_time ?? "").slice(0, 5), // "10:00:00" → "10:00"
    close: (r.close_time ?? "").slice(0, 5),
  }));

  return (
    <div className="space-y-8">
      <AdminNav />
      <header className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">Çalışma saatleri</h1>
        <p className="text-sm text-ink-soft">
          Haftalık düzen. Tek seferlik kapanışlar (bayram, izin) için &quot;İzin günleri&quot; sayfasını kullanın.
        </p>
      </header>
      <HoursForm initial={initial} />
    </div>
  );
}
