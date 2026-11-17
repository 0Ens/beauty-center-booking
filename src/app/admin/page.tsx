import { Suspense } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/adminAuth";
import { statusLabel } from "@/lib/appointmentStatus";
import { customerMessage } from "@/lib/customerMessage";
import { formatDayLong } from "@/lib/format";
import { formatPhone, toInternational } from "@/lib/phone";
import { site } from "@/lib/site";
import { getUpcomingAppointments, type AdminAppointment } from "@/data/adminAppointments";
import StatusActions from "./StatusActions";
import { signOut } from "./actions";

/*
 * PANEL ANA SAYFASI: bugün ve sonrası için randevular
 *   1) Onay bekleyenler   (yöneticinin yapması gereken iş → en üstte)
 *   2) Onaylı randevular
 *   3) İptal edilenler    (kapalı bir <details> içinde, kalabalık yapmasın)
 *
 * Oturum (çerez) her istekte okunur → bu kısım önceden hazırlanamaz,
 * <Suspense> içinde sonradan gelir (Cache Components kuralı).
 */
export default function AdminHomePage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Yükleniyor…</p>}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const { email } = await requireAdmin();
  const appointments = await getUpcomingAppointments();

  const pending = appointments.filter((a) => a.status === "pending");
  const confirmed = appointments.filter((a) => a.status === "confirmed");
  const cancelled = appointments.filter((a) => a.status === "cancelled");

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Randevular</h1>
          <p className="text-sm text-ink-soft">Giriş yapan hesap: {email}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="btn-secondary py-2">
            Çıkış Yap
          </button>
        </form>
      </header>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold">Onay bekleyenler ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-ink-soft">Bekleyen randevu talebi yok.</p>
        ) : (
          <AppointmentList items={pending} />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold">Yaklaşan onaylı randevular ({confirmed.length})</h2>
        {confirmed.length === 0 ? (
          <p className="text-sm text-ink-soft">Onaylanmış yaklaşan randevu yok.</p>
        ) : (
          <AppointmentList items={confirmed} />
        )}
      </section>

      {cancelled.length > 0 && (
        <details className="space-y-4">
          <summary className="cursor-pointer font-serif text-xl font-semibold">
            İptal edilenler ({cancelled.length})
          </summary>
          <div className="mt-4">
            <AppointmentList items={cancelled} />
          </div>
        </details>
      )}
    </div>
  );
}

function AppointmentList({ items }: { items: AdminAppointment[] }) {
  return (
    <ul className="space-y-4">
      {items.map((a) => (
        // key'de durum da var: durum değişince kart sıfırdan çizilsin
        // (ör. "Randevu iptal edilsin mi?" sorusu açık kalmasın)
        <AppointmentCard key={`${a.id}-${a.status}`} a={a} />
      ))}
    </ul>
  );
}

function AppointmentCard({ a }: { a: AdminAppointment }) {
  const intl = toInternational(a.phone);
  const message = customerMessage(a, site.name);

  return (
    <li className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">
          {formatDayLong(a.date)} · {a.time}–{a.endTime}
        </p>
        <span className="rounded-full bg-blush-100 px-3 py-1 text-xs font-medium text-brand-700">
          {statusLabel[a.status]}
        </span>
      </div>

      <div className="text-sm">
        <p className="font-medium">{a.serviceName}</p>
        <p>{a.customerName}</p>
        <p className="text-ink-soft">{formatPhone(a.phone)}</p>
        {a.note && <p className="mt-2 whitespace-pre-line rounded-xl bg-blush-50 p-3">Not: {a.note}</p>}
      </div>

      {intl && (
        <div className="flex flex-wrap gap-2 text-sm">
          <a href={`tel:+${intl}`} className="btn-secondary py-2">
            <Phone className="size-4" aria-hidden /> Ara
          </a>
          <a
            href={`https://wa.me/${intl}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary py-2"
          >
            <MessageCircle className="size-4" aria-hidden /> WhatsApp
          </a>
        </div>
      )}

      <StatusActions id={a.id} status={a.status} />
    </li>
  );
}
