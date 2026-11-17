/*
 * "Bu değişiklik şu randevularla çakışıyor" kutusu.
 * İzin günleri ve çalışma saatleri formları ortak kullanır.
 */
import Link from "next/link";
import type { AdminAppointment } from "@/data/adminAppointments";
import { statusLabel } from "@/lib/appointmentStatus";
import { formatDayLong } from "@/lib/format";

export default function ConflictNotice({ message, conflicts }: { message: string; conflicts?: AdminAppointment[] }) {
  return (
    <div role="alert" className="space-y-3 rounded-xl border border-brand-400 bg-blush-50 px-4 py-3 text-sm">
      <p className="font-medium">{message}</p>
      {conflicts && conflicts.length > 0 && (
        <>
          <ul className="list-disc space-y-1 pl-5">
            {conflicts.map((c) => (
              <li key={c.id}>
                {formatDayLong(c.date)} {c.time}–{c.endTime}: {c.customerName}, {c.serviceName} ({statusLabel[c.status]})
              </li>
            ))}
          </ul>
          <Link href="/admin" className="font-medium text-brand-700 underline">
            Randevulara git
          </Link>
        </>
      )}
    </div>
  );
}
