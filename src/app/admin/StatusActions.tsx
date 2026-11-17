"use client";
/*
 * Bir randevu kartındaki durum düğmeleri (Onayla / İptal et / ...).
 * Hangi düğmelerin görüneceğine nextStatuses() karar verir.
 * İptal yanlışlıkla basılmasın diye iki adımlı: "İptal et" → "Evet, iptal et".
 */
import { useActionState, useState } from "react";
import { actionLabel, nextStatuses, type AppointmentStatus } from "@/lib/appointmentStatus";
import { changeAppointmentStatus, type StatusState } from "./appointmentActions";

const initialState: StatusState = {};

export default function StatusActions({ id, status }: { id: number; status: AppointmentStatus }) {
  const [state, formAction, pending] = useActionState(changeAppointmentStatus, initialState);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const targets = nextStatuses(status);

  if (targets.length === 0) return null;

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={id} />

      {confirmingCancel ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Randevu iptal edilsin mi?</span>
          <button
            type="submit"
            name="status"
            value="cancelled"
            disabled={pending}
            className="inline-flex items-center rounded-full bg-red-700 px-5 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
          >
            {pending ? "İptal ediliyor…" : "Evet, iptal et"}
          </button>
          <button type="button" onClick={() => setConfirmingCancel(false)} disabled={pending} className="btn-secondary py-2">
            Vazgeç
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {targets.map((target) =>
            target === "cancelled" ? (
              <button key={target} type="button" onClick={() => setConfirmingCancel(true)} className="btn-secondary py-2">
                {actionLabel[target]}
              </button>
            ) : (
              <button key={target} type="submit" name="status" value={target} disabled={pending} className="btn-primary py-2 disabled:opacity-60">
                {pending ? "Kaydediliyor…" : status === "cancelled" ? "İptali geri al" : actionLabel[target]}
              </button>
            ),
          )}
        </div>
      )}

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
