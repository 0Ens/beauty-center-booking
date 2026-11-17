import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAllBeforeAfterForAdmin, type AdminBeforeAfter } from "@/data/adminBeforeAfter";
import { requireAdmin } from "@/lib/adminAuth";
import { beforeAfterPublicBase } from "@/lib/beforeAfterStorage";
import { formatMonth } from "@/lib/format";
import { HOME_FEATURED_LIMIT, pickHomeFeatured } from "@/lib/homeFeatured";
import { storagePathFromUrl } from "@/lib/storagePath";
import AdminNav from "../AdminNav";

export const metadata: Metadata = { title: "Öncesi / Sonrası" };

/*
 * ÖNCESİ / SONRASI: sitedeki örnekler. Ekleme, düzenleme, silme.
 */
export default function BeforeAfterAdminPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Yükleniyor…</p>}>
      <BeforeAfterAdminContent />
    </Suspense>
  );
}

async function BeforeAfterAdminContent() {
  await requireAdmin();
  const entries = await getAllBeforeAfterForAdmin();
  // Ana sayfayla AYNI kural: pasif işlemlerin örnekleri sitede hiç yok, onları önce çıkar
  const onHome = new Set(pickHomeFeatured(entries.filter((e) => e.serviceActive)).map((e) => e.id));

  return (
    <div className="space-y-8">
      <AdminNav />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold">Öncesi / Sonrası</h1>
        <Link href="/admin/oncesi-sonrasi/yeni" className="btn-primary">
          Yeni örnek ekle
        </Link>
      </header>

      {entries.length === 0 ? (
        <p className="text-sm text-ink-soft">Henüz örnek yok.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {entries.map((e) => (
            <EntryCard key={e.id} entry={e} onHome={onHome.has(e.id)} />
          ))}
        </ul>
      )}
      <p className="text-xs text-ink-soft">
        Ana sayfada en fazla {HOME_FEATURED_LIMIT} örnek görünür. &quot;Ana sayfa dolu&quot; yazanı öne almak için sıra
        numarasını küçültün ya da başka bir örneğin işaretini kaldırın.
      </p>
    </div>
  );
}

const badge = "ml-2 rounded-full px-2 py-0.5 align-middle text-xs font-medium";

function EntryCard({ entry: e, onHome }: { entry: AdminBeforeAfter; onHome: boolean }) {
  // Storage'da değilse (public/ornek/...) yayından önce silinecek örnek çizimdir
  const isSample = storagePathFromUrl(e.before, beforeAfterPublicBase) === null;

  return (
    <li className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        {[e.before, e.after].map((src, i) => (
          <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-lg bg-blush-50">
            {/* Küçük liste önizlemesi; örnek çizimler SVG olduğu için düz img */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={i === 0 ? "Öncesi" : "Sonrası"} loading="lazy" className="size-full object-cover" />
          </div>
        ))}
      </div>
      <div>
        <p className="font-semibold">
          {e.title}
          {!e.serviceActive ? (
            <span className={`${badge} bg-gray-100 text-gray-700`}>İşlem pasif: sitede görünmez</span>
          ) : onHome ? (
            <span className={`${badge} bg-blush-100 text-brand-700`}>Ana sayfada</span>
          ) : (
            e.featured && <span className={`${badge} bg-gray-100 text-gray-700`}>Ana sayfa dolu</span>
          )}
          {isSample && <span className={`${badge} bg-amber-100 text-amber-900`}>Örnek çizim</span>}
        </p>
        <p className="text-sm text-ink-soft">
          {e.serviceName} · {formatMonth(e.takenOn)} · Sıra {e.sortOrder}
        </p>
      </div>
      <Link href={`/admin/oncesi-sonrasi/${e.id}`} className="btn-secondary py-2">
        Düzenle / Sil
      </Link>
    </li>
  );
}
