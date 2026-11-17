"use client";
/*
 * ADIM 3 + 4: Saat seçimi ve müşteri bilgileri TEK FORMDA.
 *
 * Neden saatler link değil de formun içinde radyo düğmesi?
 * Seçilen saat bir başkası tarafından alınırsa sunucu refresh() ile saat
 * listesini yeniler: dolan saat kaybolur, ama ad/telefon/not kaybolmaz.
 * Müşteri sadece yeni bir saat seçip tekrar gönderir.
 *
 * useActionState(action, başlangıç) → [state, formAction, pending]
 *   state:   Server Action'ın son döndürdüğü değer (hata mesajları, girilen değerler)
 *   pending: istek sürerken true → buton "Gönderiliyor…" olur, iki kez basılamaz
 *
 * Form gönderildikten sonra React alanları sıfırlar; değerleri korumak için
 * state.values'u defaultValue olarak veriyoruz.
 */
import Link from "next/link";
import { useActionState } from "react";
import { bookAppointment } from "./actions";
import { initialBookingState, type BookingFieldName, type BookingState } from "./bookingState";
import StepHeading from "./StepHeading";

type Props = {
  slug: string;
  date: string;
  dateLabel: string; // "24 Kasım 2026 Salı"
  slots: string[]; // ["10:00", "10:15", ...]
};

const inputClass =
  "mt-1 w-full rounded-xl border border-blush-300 bg-white px-4 py-2.5 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-400/40";

/** Alanın altındaki kırmızı yazı (aria-describedby ile alana bağlı → ekran okuyucu da okur) */
function FieldError({ state, name }: { state: BookingState; name: BookingFieldName }) {
  const message = state.fieldErrors?.[name]?.[0];
  if (!message) return null;
  return (
    <p id={`${name}-error`} className="mt-1 text-sm text-brand-800">
      {message}
    </p>
  );
}

export default function BookingForm({ slug, date, dateLabel, slots }: Props) {
  const [state, formAction, pending] = useActionState(bookAppointment, initialBookingState);
  const values = state.values;

  return (
    <form action={formAction} className="space-y-10">
      {/* URL'deki seçimler: sunucu bunları da tekrar kontrol ediyor */}
      <input type="hidden" name="islem" value={slug} />
      <input type="hidden" name="tarih" value={date} />

      {state.error && (
        <p role="alert" className="rounded-2xl border border-brand-400 bg-blush-100 px-5 py-4 text-sm font-medium">
          {state.error}
        </p>
      )}

      <fieldset>
        <StepHeading n={3} title="Saat seçin" as="legend" />
        <p className="mb-4 text-sm text-ink-soft">{dateLabel}</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {slots.map((slot) => (
            <label
              key={slot}
              className="cursor-pointer rounded-xl border border-blush-300 bg-white py-2.5 text-center text-sm font-medium transition-colors hover:border-brand-500 has-checked:border-brand-700 has-checked:bg-brand-700 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-700"
            >
              <input
                type="radio"
                name="time"
                value={slot}
                required
                defaultChecked={values?.time === slot}
                className="sr-only"
              />
              {slot}
            </label>
          ))}
        </div>
        <FieldError state={state} name="time" />
      </fieldset>

      <fieldset className="space-y-5">
        <StepHeading n={4} title="Bilgileriniz" as="legend" />

        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Adınız Soyadınız
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            defaultValue={values?.name}
            aria-invalid={!!state.fieldErrors?.name}
            aria-describedby="name-error"
            className={inputClass}
          />
          <FieldError state={state} name="name" />
        </div>

        <div>
          <label htmlFor="phone" className="text-sm font-medium">
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0532 123 45 67"
            required
            defaultValue={values?.phone}
            aria-invalid={!!state.fieldErrors?.phone}
            aria-describedby="phone-error"
            className={inputClass}
          />
          <FieldError state={state} name="phone" />
        </div>

        <div>
          <label htmlFor="note" className="text-sm font-medium">
            Not <span className="font-normal text-ink-soft">(isteğe bağlı)</span>
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            maxLength={500}
            defaultValue={values?.note}
            aria-describedby="note-hint note-error"
            className={inputClass}
          />
          {/* KVKK: sağlık verisi "özel nitelikli" veri; hiç toplamamak en güvenlisi */}
          <p id="note-hint" className="mt-1 text-xs text-ink-soft">
            Lütfen sağlık bilgisi (hastalık, ilaç, hamilelik vb.) yazmayın; gerekiyorsa randevuda konuşalım.
          </p>
          <FieldError state={state} name="note" />
        </div>

        <div>
          <label className="flex gap-3 text-sm text-ink-soft">
            <input
              type="checkbox"
              name="kvkk"
              required
              defaultChecked={values?.kvkk}
              aria-describedby="kvkk-error"
              className="mt-0.5 size-5 shrink-0 accent-brand-700"
            />
            {/*
              "Kabul ediyorum" (açık rıza) DEĞİL, "okudum" (aydınlatma): randevu verisi
              sözleşme gereği işleniyor (KVKK 5/2-c). Ayrıntı: /kvkk sayfasındaki açıklama.
              Yeni sekmede açılıyor: formdaki ad/telefon kaybolmasın.
            */}
            <span>
              Kişisel verilerimin randevum için nasıl işlendiğini anlatan{" "}
              <Link href="/kvkk" target="_blank" rel="noopener" className="font-medium text-brand-700 underline">
                KVKK Aydınlatma Metni
              </Link>
              &apos;ni okudum.
            </span>
          </label>
          <FieldError state={state} name="kvkk" />
        </div>
      </fieldset>

      <button type="submit" disabled={pending} className="btn-primary w-full py-3 disabled:opacity-60 sm:w-auto">
        {pending ? "Gönderiliyor…" : "Randevuyu Oluştur"}
      </button>
    </form>
  );
}
