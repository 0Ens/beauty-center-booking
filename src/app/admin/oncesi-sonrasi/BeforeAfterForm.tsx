"use client";
/*
 * Öncesi/sonrası ekleme ve düzenleme formu.
 *
 * Diğer formlardan farkı: fotoğraflar GÖNDERMEDEN ÖNCE tarayıcıda küçültülüyor.
 * Bu yüzden form kendi kendine gönderilmiyor (action={...} yok):
 *   onSubmit → formdaki alanları topla → yerine KÜÇÜLTÜLMÜŞ fotoğrafları koy
 *   → Server Action'ı biz çağırıyoruz.
 * Dosya seçme kutularının "name"i yok: büyük asıl dosyalar hiç gönderilmesin.
 *
 * Yan etki: React formu sıfırlamıyor → hata olursa yazılanlar ve seçilen
 * fotoğraflar yerinde kalıyor.
 */
import Link from "next/link";
import { startTransition, useActionState, useEffect, useState, type FormEvent } from "react";
import { HOME_FEATURED_LIMIT } from "@/lib/homeFeatured";
import { PhotoError, resizeToJpeg } from "@/lib/photo";
import { deleteBeforeAfter, saveBeforeAfter, type BeforeAfterState, type DeleteState } from "./actions";

const inputClass =
  "mt-1 w-full rounded-xl border border-blush-300 bg-white px-4 py-2.5 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/40";
const labelClass = "text-sm font-medium";

export type BeforeAfterFormValues = {
  serviceId: string;
  title: string;
  description: string;
  takenOn: string;
  featured: boolean;
  sortOrder: string;
};

export type ServiceOption = { id: number; name: string; isActive: boolean };

type Props = {
  id?: number; // varsa düzenleme
  initial: BeforeAfterFormValues;
  services: ServiceOption[];
  today: string; // tarih kutusunda ileri tarih seçilemesin
  photos?: { before: string; after: string }; // düzenlemede mevcut fotoğraflar
};

const initialState: BeforeAfterState = {};

export default function BeforeAfterForm({ id, initial, services, today, photos }: Props) {
  const [state, formAction, pending] = useActionState(saveBeforeAfter, initialState);
  const [before, setBefore] = useState<Picked | null>(null);
  const [after, setAfter] = useState<Picked | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const isNew = id === undefined;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClientError(null);
    const fd = new FormData(e.currentTarget);
    if (isNew) {
      if (!before || !after) {
        setClientError("Öncesi ve sonrası fotoğraflarını seçin.");
        return;
      }
      fd.set("before", before.blob, "oncesi.jpg");
      fd.set("after", after.blob, "sonrasi.jpg");
    }
    // Server Action'ı elle çağırırken startTransition şart: pending durumu bununla çalışır
    startTransition(() => formAction(fd));
  }

  const error = clientError ?? state.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
      {!isNew && <input type="hidden" name="id" value={id} />}

      {state.saved && !clientError && (
        <p role="status" className="rounded-xl bg-blush-100 px-4 py-3 text-sm font-medium">
          Kaydedildi. Sitede hemen güncellendi.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {isNew ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <PhotoPicker label="Öncesi" value={before} onChange={setBefore} />
          <PhotoPicker label="Sonrası" value={after} onChange={setAfter} />
        </div>
      ) : (
        photos && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <SavedPhoto src={photos.before} label="Öncesi" />
              <SavedPhoto src={photos.after} label="Sonrası" />
            </div>
            <p className="text-xs text-ink-soft">
              Fotoğraflar değiştirilemez. Yanlışsa bu örneği silip yeniden ekleyin (yeni fotoğraf için yeni onay gerekir).
            </p>
          </div>
        )
      )}

      <div>
        <label htmlFor="serviceId" className={labelClass}>
          İşlem
        </label>
        <select id="serviceId" name="serviceId" required defaultValue={initial.serviceId} className={inputClass}>
          <option value="" disabled>
            Seçin…
          </option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.isActive ? "" : " (pasif: sitede görünmez)"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>
          Başlık
        </label>
        <input id="title" name="title" required maxLength={80} defaultValue={initial.title} className={inputClass} />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Açıklama
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={10}
          maxLength={500}
          rows={3}
          defaultValue={initial.description}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-ink-soft">Müşterinin adını veya tanınmasını sağlayacak bir bilgi yazmayın.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="takenOn" className={labelClass}>
            Tarih
          </label>
          <input
            id="takenOn"
            name="takenOn"
            type="date"
            required
            max={today}
            defaultValue={initial.takenOn}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="sortOrder" className={labelClass}>
            Sıra <span className="font-normal text-ink-soft">(küçük olan önce)</span>
          </label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            required
            defaultValue={initial.sortOrder}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="featured" defaultChecked={initial.featured} className="size-5 accent-brand-700" />
          Ana sayfada göster
        </label>
        <p className="mt-1 text-xs text-ink-soft">
          Ana sayfada en fazla {HOME_FEATURED_LIMIT} örnek görünür: işaretliler arasından sıra numarası en küçük olanlar.
          Yeni örnekler en başa eklenir.
        </p>
      </div>

      {isNew && (
        <label className="flex items-start gap-3 rounded-xl border border-blush-300 bg-blush-50 p-4 text-sm">
          <input type="checkbox" name="consent" required className="mt-0.5 size-5 shrink-0 accent-brand-700" />
          <span>
            <strong>KVKK:</strong> Bu fotoğrafların sitede yayınlanması için müşteriden <strong>yazılı açık rıza</strong>{" "}
            aldım. İmzalı onay formu salonda saklanıyor.
          </span>
        </label>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? (isNew ? "Yükleniyor…" : "Kaydediliyor…") : isNew ? "Ekle" : "Kaydet"}
        </button>
        <Link href="/admin/oncesi-sonrasi" className="text-sm text-ink-soft underline hover:text-ink">
          Listeye dön
        </Link>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------
// Fotoğraf seçici: seçilince hemen küçültür ve önizleme gösterir
// ---------------------------------------------------------------------
type Picked = { blob: Blob; previewUrl: string; width: number; height: number };

function PhotoPicker({ label, value, onChange }: { label: string; value: Picked | null; onChange: (p: Picked | null) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = `photo-${label}`;

  // Önizleme adresi (blob:...) bellekte yer tutar: fotoğraf değişince
  // veya sayfadan çıkınca eskisini bırak
  useEffect(() => {
    return () => {
      if (value) URL.revokeObjectURL(value.previewUrl);
    };
  }, [value]);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const resized = await resizeToJpeg(file);
      onChange({ ...resized, previewUrl: URL.createObjectURL(resized.blob) });
    } catch (err) {
      onChange(null);
      setError(err instanceof PhotoError ? err.message : "Fotoğraf işlenemedi.");
      e.target.value = ""; // aynı dosyayı tekrar seçebilsin
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className={labelClass}>
        {label} fotoğrafı
      </label>
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-dashed border-blush-300 bg-blush-50">
        {value ? (
          // blob: adresi next/image ile optimize edilemez (sunucu göremez); düz <img> doğru seçim
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.previewUrl} alt={`${label} önizleme`} className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center p-4 text-center text-sm text-ink-soft">
            {busy ? "Hazırlanıyor…" : "Fotoğraf seçilmedi"}
          </span>
        )}
      </div>
      {/* name YOK: büyük asıl dosya gönderilmez, küçültülmüşü onSubmit'te ekleniyor */}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={busy}
        className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-blush-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700"
      />
      {value && (
        <p className="text-xs text-ink-soft">
          {value.width}×{value.height}, {Math.round(value.blob.size / 1024)} KB (konum bilgisi silindi)
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function SavedPhoto({ src, label }: { src: string; label: string }) {
  return (
    <figure className="space-y-1">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-blush-50">
        {/* Küçük önizleme; next/image yerine düz img: örnek çizimler SVG, gerçekler Storage'da */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="size-full object-cover" />
      </div>
      <figcaption className="text-xs text-ink-soft">{label}</figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------
// Silme: iki adımlı (yanlışlıkla basılmasın)
// ---------------------------------------------------------------------
const initialDelete: DeleteState = {};

export function DeleteBeforeAfter({ id }: { id: number }) {
  const [state, formAction, pending] = useActionState(deleteBeforeAfter, initialDelete);
  const [confirming, setConfirming] = useState(false);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Örnek ve fotoğrafları tamamen silinsin mi? Geri alınamaz.</span>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center rounded-full bg-red-700 px-5 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
          >
            {pending ? "Siliniyor…" : "Evet, sil"}
          </button>
          <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="btn-secondary py-2">
            Vazgeç
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="btn-secondary py-2">
          Sil
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
