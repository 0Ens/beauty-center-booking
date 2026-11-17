"use client";
/*
 * İşlem ekleme / düzenleme formu (ikisi aynı form).
 * service verilirse düzenleme: gizli "id" alanı dolu gider.
 */
import Link from "next/link";
import { useActionState, useState } from "react";
import { iconLabels, iconNames, serviceIcons } from "@/components/serviceIcons";
import { saveService, setServiceActive, type ActiveState, type ServiceFormValues, type ServiceState } from "./actions";

const inputClass =
  "mt-1 w-full rounded-xl border border-blush-300 bg-white px-4 py-2.5 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/40";
const labelClass = "text-sm font-medium";
const hintClass = "font-normal text-ink-soft";

const initialState: ServiceState = {};

type Props = {
  id?: number;
  slug?: string; // sadece düzenlemede: değişmeyen adres
  initial: ServiceFormValues;
  categories: string[]; // var olan kategoriler (aynı yazılsın diye öneri)
};

export default function ServiceForm({ id, slug, initial, categories }: Props) {
  const [state, formAction, pending] = useActionState(saveService, initialState);
  const v = state.values ?? initial;

  return (
    // key: hata sonrası girilen değerler, başarı sonrası kaydedilen hali gelsin
    <form key={JSON.stringify(v)} action={formAction} className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
      {id !== undefined && <input type="hidden" name="id" value={id} />}

      {state.saved && (
        <p role="status" className="rounded-xl bg-blush-100 px-4 py-3 text-sm font-medium">
          Kaydedildi. Sitede hemen güncellendi.
        </p>
      )}
      {state.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="name" className={labelClass}>
          İşlem adı
        </label>
        <input id="name" name="name" required maxLength={80} defaultValue={v.name} className={inputClass} />
        {slug ? (
          <p className="mt-1 text-xs text-ink-soft">
            Sitedeki adresi: /islemlerimiz/{slug} (ad değişse de adres aynı kalır, paylaşılmış linkler bozulmasın diye)
          </p>
        ) : (
          <p className="mt-1 text-xs text-ink-soft">Sitedeki adres bu addan oluşur ve sonradan değişmez.</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={labelClass}>
            Kategori
          </label>
          {/* datalist: var olan kategorileri öner; "Cilt Bakımı" ile "cilt bakımı" ayrı kategori olmasın */}
          <input id="category" name="category" required maxLength={40} list="categories" defaultValue={v.category} className={inputClass} />
          <datalist id="categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor="durationMin" className={labelClass}>
            Süre <span className={hintClass}>(dakika)</span>
          </label>
          <input id="durationMin" name="durationMin" type="number" required min={5} max={480} step={5} inputMode="numeric" defaultValue={v.durationMin} className={inputClass} />
        </div>
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className={`${labelClass} mb-1`}>
          Fiyat <span className={hintClass}>(TL, boş bırakılırsa &quot;fiyat için arayın&quot;)</span>
        </legend>
        <div>
          <label htmlFor="priceMin" className="text-xs text-ink-soft">
            En düşük
          </label>
          <input id="priceMin" name="priceMin" type="number" min={0} step={1} inputMode="numeric" defaultValue={v.priceMin} className={inputClass} />
        </div>
        <div>
          <label htmlFor="priceMax" className="text-xs text-ink-soft">
            En yüksek <span className={hintClass}>(tek fiyatsa boş)</span>
          </label>
          <input id="priceMax" name="priceMax" type="number" min={0} step={1} inputMode="numeric" defaultValue={v.priceMax} className={inputClass} />
        </div>
      </fieldset>

      <div>
        <label htmlFor="summary" className={labelClass}>
          Kısa açıklama <span className={hintClass}>(işlem kartlarında görünür)</span>
        </label>
        <textarea id="summary" name="summary" required minLength={10} maxLength={200} rows={2} defaultValue={v.summary} className={inputClass} />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Açıklama <span className={hintClass}>(işlem sayfasında görünür)</span>
        </label>
        <textarea id="description" name="description" required minLength={20} maxLength={3000} rows={6} defaultValue={v.description} className={inputClass} />
      </div>

      <div>
        <label htmlFor="suitableFor" className={labelClass}>
          Kimler için uygun? <span className={hintClass}>(her satıra bir madde, en fazla 10)</span>
        </label>
        <textarea id="suitableFor" name="suitableFor" rows={4} defaultValue={v.suitableFor} className={inputClass} />
      </div>

      <fieldset>
        <legend className={labelClass}>İkon</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {iconNames.map((name) => {
            const Icon = serviceIcons[name];
            return (
              <label key={name} className="cursor-pointer">
                {/* peer: radyo seçilince yanındaki kutu renklenir */}
                <input type="radio" name="icon" value={name} required defaultChecked={v.icon === name} className="peer sr-only" />
                <span className="flex size-12 items-center justify-center rounded-full bg-blush-100 text-brand-700 peer-checked:bg-brand-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400">
                  <Icon size={22} strokeWidth={1.5} aria-hidden />
                  <span className="sr-only">{iconLabels[name]}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={v.featured} className="size-4 accent-brand-700" />
          Ana sayfada göster
        </label>
        <div>
          <label htmlFor="sortOrder" className={labelClass}>
            Sıra <span className={hintClass}>(küçük sayı önce gösterilir)</span>
          </label>
          <input id="sortOrder" name="sortOrder" type="number" min={0} max={999} step={1} inputMode="numeric" defaultValue={v.sortOrder} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? "Kaydediliyor…" : id === undefined ? "İşlemi ekle" : "Kaydet"}
        </button>
        <Link href="/admin/islemler" className="text-sm text-ink-soft underline hover:text-ink">
          Listeye dön
        </Link>
      </div>
    </form>
  );
}

const initialActive: ActiveState = {};

/** Pasife al: yanlışlıkla basılmasın diye iki adımlı. Tekrar yayınla: tek tık (zararsız) */
export function ActiveToggle({ id, active }: { id: number; active: boolean }) {
  const [state, formAction, pending] = useActionState(setServiceActive, initialActive);
  const [confirming, setConfirming] = useState(false);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={String(!active)} />
      {!active ? (
        <button type="submit" disabled={pending} className="btn-secondary py-2 disabled:opacity-60">
          {pending ? "Yayınlanıyor…" : "Tekrar yayınla"}
        </button>
      ) : confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">
            Pasife alınsın mı? Sitede ve rezervasyonda görünmez; alınmış randevular etkilenmez.
          </span>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center rounded-full bg-red-700 px-5 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
          >
            {pending ? "Kaydediliyor…" : "Evet, pasife al"}
          </button>
          <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="btn-secondary py-2">
            Vazgeç
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="btn-secondary py-2">
          Pasife al
        </button>
      )}
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
