"use client";
/*
 * Haftanın 7 günü tek formda. "Kapalı" işaretlenince o günün saat kutuları
 * pasif olur (gönderilmez; sunucu eski saatleri saklar, tekrar açınca geri gelir).
 */
import { useActionState, useState } from "react";
import { dayNames, mondayFirst } from "@/lib/hours";
import ConflictNotice from "../ConflictNotice";
import { saveWorkingHours, type HoursInput, type HoursState } from "./actions";

const timeClass =
  "w-full rounded-xl border border-blush-300 bg-white px-3 py-2 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/40 disabled:bg-blush-50 disabled:text-ink-soft";

const initialState: HoursState = {};

export default function HoursForm({ initial }: { initial: HoursInput[] }) {
  const [state, formAction, pending] = useActionState(saveWorkingHours, initialState);
  // Hata olduysa girilen değerler, yoksa veritabanındaki hali.
  // Kapalı günün saat kutuları pasif olduğu için gönderilmez → saatleri veritabanındaki halinden al
  const days =
    state.values?.map((v) => {
      const saved = initial.find((i) => i.weekday === v.weekday);
      return v.closed && !v.open && saved ? { ...v, open: saved.open, close: saved.close } : v;
    }) ?? initial;

  return (
    // key: her sonuçta yeniden çizilir → hata sonrası girilen değerler geri gelir
    <form key={JSON.stringify(days)} action={formAction} className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
      {state.saved && (
        <p role="status" className="rounded-xl bg-blush-100 px-4 py-3 text-sm font-medium">
          Çalışma saatleri kaydedildi. Rezervasyon takvimi ve iletişim sayfası güncellendi.
        </p>
      )}
      {state.error && <ConflictNotice message={state.error} conflicts={state.conflicts} />}

      <ul className="divide-y divide-blush-100">
        {[...days]
          .sort((a, b) => mondayFirst(a.weekday) - mondayFirst(b.weekday))
          .map((d) => (
            <DayRow key={d.weekday} day={d} />
          ))}
      </ul>

      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
        {pending ? "Kaydediliyor…" : "Saatleri kaydet"}
      </button>
    </form>
  );
}

function DayRow({ day }: { day: HoursInput }) {
  const [closed, setClosed] = useState(day.closed);
  const name = dayNames[day.weekday];

  return (
    <li className="grid grid-cols-2 items-center gap-3 py-3 sm:grid-cols-[8rem_6rem_1fr_1fr]">
      <span className="font-medium">{name}</span>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name={`closed-${day.weekday}`}
          checked={closed}
          onChange={(e) => setClosed(e.target.checked)}
          className="size-4 accent-brand-700"
        />
        Kapalı
      </label>
      <label className="text-sm">
        <span className="sr-only">{name} açılış</span>
        <span aria-hidden className="text-xs text-ink-soft">
          Açılış
        </span>
        {/* step=900 saniye = 15 dakika (takvim 15 dakikalık adımlarla çalışıyor) */}
        <input
          type="time"
          name={`open-${day.weekday}`}
          step={900}
          defaultValue={day.open}
          disabled={closed}
          required={!closed}
          className={timeClass}
        />
      </label>
      <label className="text-sm">
        <span className="sr-only">{name} kapanış</span>
        <span aria-hidden className="text-xs text-ink-soft">
          Kapanış
        </span>
        <input
          type="time"
          name={`close-${day.weekday}`}
          step={900}
          defaultValue={day.close}
          disabled={closed}
          required={!closed}
          className={timeClass}
        />
      </label>
    </li>
  );
}
