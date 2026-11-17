import type { Metadata } from "next";
import { Suspense } from "react";
import { getUpcomingBlockedRanges } from "@/data/adminBlockedDates";
import { requireAdmin } from "@/lib/adminAuth";
import { formatDayLong } from "@/lib/format";
import { nowInIstanbul } from "@/lib/istanbulTime";
import AdminNav from "../AdminNav";
import { AddLeaveForm, DeleteLeaveButton } from "./LeaveForms";

export const metadata: Metadata = { title: "İzin günleri" };

/*
 * İZİN GÜNLERİ: salonun kapalı olacağı tarihler.
 * Burada eklenen günler rezervasyon takviminde seçilemez.
 */
export default function LeavePage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Yükleniyor…</p>}>
      <LeaveContent />
    </Suspense>
  );
}

async function LeaveContent() {
  await requireAdmin();
  const ranges = await getUpcomingBlockedRanges();
  const { date: today } = nowInIstanbul();

  return (
    <div className="space-y-8">
      <AdminNav />
      <h1 className="font-serif text-3xl font-semibold">İzin günleri</h1>

      <AddLeaveForm today={today} />

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold">Yaklaşan izinler ({ranges.length})</h2>
        {ranges.length === 0 ? (
          <p className="text-sm text-ink-soft">Kayıtlı izin yok.</p>
        ) : (
          <ul className="space-y-4">
            {ranges.map((r) => (
              <li key={r.id} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
                <p className="font-semibold">
                  {r.startsOn === r.endsOn
                    ? formatDayLong(r.startsOn)
                    : `${formatDayLong(r.startsOn)} – ${formatDayLong(r.endsOn)}`}
                </p>
                {r.reason && <p className="text-sm text-ink-soft">Not: {r.reason}</p>}
                <DeleteLeaveButton id={r.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
