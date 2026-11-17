import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { serviceIcons } from "@/components/serviceIcons";
import { getAllServicesForAdmin, type AdminService } from "@/data/adminServices";
import { requireAdmin } from "@/lib/adminAuth";
import AdminNav from "../AdminNav";
import { ActiveToggle } from "./ServiceForm";

export const metadata: Metadata = { title: "İşlemler" };

/*
 * İŞLEMLER: sitedeki hizmet listesi. Ekleme, düzenleme, pasife alma.
 * Silme yok: geçmiş randevular işleme bağlı (bkz. 0012).
 */
export default function ServicesPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Yükleniyor…</p>}>
      <ServicesContent />
    </Suspense>
  );
}

async function ServicesContent() {
  await requireAdmin();
  const services = await getAllServicesForAdmin();
  const active = services.filter((s) => s.isActive);
  const inactive = services.filter((s) => !s.isActive);

  return (
    <div className="space-y-8">
      <AdminNav />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold">İşlemler</h1>
        <Link href="/admin/islemler/yeni" className="btn-primary">
          Yeni işlem ekle
        </Link>
      </header>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold">Sitede görünenler ({active.length})</h2>
        {active.length === 0 ? (
          <p className="text-sm text-ink-soft">Yayında işlem yok.</p>
        ) : (
          <ul className="space-y-4">
            {active.map((s) => (
              <ServiceRow key={`${s.id}-${s.isActive}`} service={s} />
            ))}
          </ul>
        )}
      </section>

      {inactive.length > 0 && (
        <details className="space-y-4">
          <summary className="cursor-pointer font-serif text-2xl font-semibold">Pasif işlemler ({inactive.length})</summary>
          <ul className="mt-4 space-y-4">
            {inactive.map((s) => (
              <ServiceRow key={`${s.id}-${s.isActive}`} service={s} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function formatPrice(min: number | null, max: number | null): string {
  const tl = (n: number) => `${n.toLocaleString("tr-TR")} TL`;
  if (min === null) return "Fiyat için arayın";
  if (max === null) return `${tl(min)}'den başlayan`;
  if (min === max) return tl(min);
  return `${tl(min)} – ${tl(max)}`;
}

function ServiceRow({ service: s }: { service: AdminService }) {
  const Icon = serviceIcons[s.icon];
  return (
    <li className={`space-y-3 rounded-2xl bg-white p-5 shadow-sm ${s.isActive ? "" : "opacity-75"}`}>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blush-100 text-brand-700">
          <Icon size={20} strokeWidth={1.5} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {s.name}
            {s.featured && (
              <span className="ml-2 rounded-full bg-blush-100 px-2 py-0.5 align-middle text-xs font-medium text-brand-700">
                Ana sayfada
              </span>
            )}
          </p>
          <p className="text-sm text-ink-soft">
            {s.category} · {s.durationMin} dk · {formatPrice(s.priceMin, s.priceMax)} · Sıra {s.sortOrder}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-2">
        <Link href={`/admin/islemler/${s.id}`} className="btn-secondary py-2">
          Düzenle
        </Link>
        <ActiveToggle id={s.id} active={s.isActive} />
      </div>
    </li>
  );
}
