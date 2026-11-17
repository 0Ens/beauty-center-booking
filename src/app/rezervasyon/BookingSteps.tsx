/*
 * REZERVASYON ADIMLARI (sunucu bileşeni)
 *
 * Bütün seçimler URL'de duruyor:
 *   /rezervasyon                                   → 1. işlem seç
 *   /rezervasyon?islem=kirpik-lifting              → 2. gün seç
 *   /rezervasyon?islem=kirpik-lifting&tarih=2026-11-24 → 3-4. saat + bilgiler (form)
 *
 * Neden URL? Seçimler sade linkler: JavaScript yüklenmeden de çalışır, geri
 * tuşu bir önceki adıma döner, link paylaşılabilir.
 *
 * URL'yi herkes elle değiştirebilir → hiçbir değere körü körüne güvenmiyoruz:
 * işlem listede yoksa, gün seçilemez bir günse o adım "seçilmemiş" sayılır.
 */
import Link from "next/link";
import { Clock } from "lucide-react";
import { getBookableDays, getDaySlots } from "@/data/availability";
import { getServices } from "@/data/services";
import { weekdayOf } from "@/lib/bookingDay";
import { formatDayLong, formatMonthShort } from "@/lib/format";
import { toTime } from "@/lib/slots";
import BookingForm from "./BookingForm";
import StepHeading from "./StepHeading";

type SearchParams = Record<string, string | string[] | undefined>;

/** ?islem=a&islem=b gibi tekrarlı parametrelerde dizi gelir; sadece tek değeri kabul ediyoruz */
function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

const weekdayHeaders = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default async function BookingSteps({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const services = await getServices();
  const service = services.find((s) => s.slug === single(params.islem));

  const days = service ? await getBookableDays() : [];
  const date = days.find((d) => d.bookable && d.date === single(params.tarih))?.date;
  const slots = service && date ? (await getDaySlots(service.durationMin, date)).map(toTime) : [];

  // Takvim Pazartesi'den başlıyor: ilk günün önüne kaç boş kutu koymalı?
  // weekdayOf: 0 = Pazar → (0 + 6) % 7 = 6 boş kutu; 1 = Pazartesi → 0
  const leadingBlanks = days.length > 0 ? (weekdayOf(days[0].date) + 6) % 7 : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-14">
      {/* 1. İŞLEM */}
      <section>
        <StepHeading n={1} title="İşlem seçin" />
        <ul className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => {
            const selected = s.slug === service?.slug;
            return (
              <li key={s.slug}>
                <Link
                  href={`/rezervasyon?islem=${s.slug}#gun`}
                  aria-current={selected ? "step" : undefined}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-4 transition-colors ${
                    selected
                      ? "border-brand-700 bg-brand-700 text-white"
                      : "border-blush-300 bg-white hover:border-brand-500"
                  }`}
                >
                  <span className="font-medium">{s.name}</span>
                  <span className={`flex shrink-0 items-center gap-1 text-xs ${selected ? "text-blush-100" : "text-ink-soft"}`}>
                    <Clock size={14} aria-hidden />
                    {s.durationMin} dk
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 2. GÜN (işlem seçildiyse) */}
      {service && (
        <section id="gun" className="scroll-mt-28">
          <StepHeading n={2} title="Gün seçin" />
          <div className="rounded-3xl bg-white p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink-soft sm:gap-2" aria-hidden>
              {weekdayHeaders.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <ol className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: leadingBlanks }, (_, i) => (
                <li key={`bos-${i}`} aria-hidden />
              ))}
              {days.map((day, i) => {
                const dayNumber = Number(day.date.slice(8, 10));
                // Ayın ilk günü ya da takvimin ilk günü → üstüne ay adını yaz
                const monthLabel = i === 0 || dayNumber === 1 ? formatMonthShort(day.date) : "";
                const content = (
                  <>
                    <span className="block h-3 text-[10px] leading-3 uppercase">{monthLabel}</span>
                    <span className="block text-base">{dayNumber}</span>
                  </>
                );
                const base = "block rounded-xl py-1.5 text-center";

                if (!day.bookable) {
                  return (
                    <li key={day.date}>
                      <span className={`${base} text-ink-soft/40 line-through`} aria-label={`${formatDayLong(day.date)}, kapalı`}>
                        {content}
                      </span>
                    </li>
                  );
                }
                const selected = day.date === date;
                return (
                  <li key={day.date}>
                    <Link
                      href={`/rezervasyon?islem=${service.slug}&tarih=${day.date}#saat`}
                      aria-current={selected ? "date" : undefined}
                      aria-label={formatDayLong(day.date)}
                      className={`${base} font-medium transition-colors ${
                        selected ? "bg-brand-700 text-white" : "bg-blush-50 hover:bg-blush-200"
                      }`}
                    >
                      {content}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* 3 + 4. SAAT VE BİLGİLER (gün seçildiyse) */}
      {service && date && (
        <section id="saat" className="scroll-mt-28">
          {slots.length > 0 ? (
            // key: gün değişince form sıfırdan başlasın (eski günün hata mesajı kalmasın)
            <BookingForm key={date} slug={service.slug} date={date} dateLabel={formatDayLong(date)} slots={slots} />
          ) : (
            <>
              <StepHeading n={3} title="Saat seçin" />
              <p className="rounded-2xl bg-white p-6 text-center text-ink-soft">
                {formatDayLong(date)} için boş saat kalmadı. Lütfen başka bir gün seçin.
              </p>
            </>
          )}
        </section>
      )}
    </div>
  );
}
