"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { formatDayLong } from "@/lib/format";
import { addBlockedRange, deleteBlockedRange, type AddLeaveState, type DeleteLeaveState } from "./actions";

const inputClass =
  "mt-1 w-full rounded-xl border border-blush-300 bg-white px-4 py-2.5 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/40";

const initialAdd: AddLeaveState = {};

/** Yeni izin ekleme formu */
export function AddLeaveForm({ today }: { today: string }) {
  const [state, formAction, pending] = useActionState(addBlockedRange, initialAdd);
  const v = state.values;

  return (
    // key: her sonuçta form yeniden çizilir → hata sonrası girilen değerler geri gelir,
    // başarı sonrası (values yok) form boşalır
    <form key={JSON.stringify(v ?? null) + String(state.saved ?? "")} action={formAction} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-serif text-2xl font-semibold">İzin ekle</h2>

      {state.saved && (
        <p role="status" className="rounded-xl bg-blush-100 px-4 py-3 text-sm font-medium">
          İzin eklendi. Bu günler rezervasyon takviminde kapalı görünüyor.
        </p>
      )}

      {state.error && (
        <div role="alert" className="space-y-3 rounded-xl border border-brand-400 bg-blush-50 px-4 py-3 text-sm">
          <p className="font-medium">{state.error}</p>
          {state.conflicts && (
            <>
              <ul className="list-disc space-y-1 pl-5">
                {state.conflicts.map((c) => (
                  <li key={c.id}>
                    {formatDayLong(c.date)} {c.time}: {c.customerName}, {c.serviceName} ({c.statusText})
                  </li>
                ))}
              </ul>
              <Link href="/admin" className="font-medium text-brand-700 underline">
                Randevulara git
              </Link>
            </>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startsOn" className="text-sm font-medium">
            Başlangıç
          </label>
          <input id="startsOn" name="startsOn" type="date" required min={today} defaultValue={v?.startsOn} className={inputClass} />
        </div>
        <div>
          <label htmlFor="endsOn" className="text-sm font-medium">
            Bitiş <span className="font-normal text-ink-soft">(tek gün ise boş bırakın)</span>
          </label>
          <input id="endsOn" name="endsOn" type="date" min={today} defaultValue={v?.endsOn} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="reason" className="text-sm font-medium">
          Not <span className="font-normal text-ink-soft">(isteğe bağlı, müşteriler görmez)</span>
        </label>
        <input id="reason" name="reason" type="text" maxLength={200} placeholder="Örn. bayram, eğitim" defaultValue={v?.reason} className={inputClass} />
      </div>

      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
        {pending ? "Kaydediliyor…" : "İzni ekle"}
      </button>
    </form>
  );
}

const initialDelete: DeleteLeaveState = {};

/** İzin silme: yanlışlıkla basılmasın diye iki adımlı */
export function DeleteLeaveButton({ id }: { id: number }) {
  const [state, formAction, pending] = useActionState(deleteBlockedRange, initialDelete);
  const [confirming, setConfirming] = useState(false);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">İzin silinsin mi? Bu günler tekrar randevuya açılır.</span>
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
