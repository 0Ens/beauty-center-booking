"use server";
/*
 * ÇALIŞMA SAATLERİNİ KAYDET (Server Action)
 *
 * Form 7 günü birden gönderir. Sırayla:
 *   1) Her gün için saatler geçerli mi? (açıksa açılış < kapanış)
 *   2) İleride alınmış (bekleyen/onaylı) randevulardan yeni saatlerin
 *      DIŞINDA kalan var mı? Varsa kaydetme, listele (izin günleriyle aynı kural).
 *   3) Sadece DEĞİŞEN günleri güncelle.
 *   4) Ziyaretçi tarafındaki önbelleği hemen sil (iletişim sayfası, footer, takvim).
 */
import { refresh, updateTag } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { getActiveAppointmentsBetween, type AdminAppointment } from "@/data/adminAppointments";
import { requireAdmin } from "@/lib/adminAuth";
import { weekdayOf } from "@/lib/bookingDay";
import { dayNames, type WorkingHoursRow } from "@/lib/hours";
import { toMinutes } from "@/lib/slots";
import { fitsHours } from "@/lib/workingHoursRules";

/** Formdaki bir günün hali (saatler "HH:MM" ya da boş) */
export type HoursInput = { weekday: number; closed: boolean; open: string; close: string };

export type HoursState = {
  error?: string;
  conflicts?: AdminAppointment[];
  saved?: boolean;
  values?: HoursInput[]; // hata olursa form girilen haliyle kalsın
};

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

function readForm(formData: FormData): HoursInput[] {
  return [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
    weekday,
    closed: formData.get(`closed-${weekday}`) === "on",
    open: String(formData.get(`open-${weekday}`) ?? ""),
    close: String(formData.get(`close-${weekday}`) ?? ""),
  }));
}

export async function saveWorkingHours(_prev: HoursState, formData: FormData): Promise<HoursState> {
  const { supabase } = await requireAdmin();
  const values = readForm(formData);

  // 1) Geçerlilik: açık günlerde iki saat de dolu ve açılış < kapanış
  for (const d of values) {
    if (d.closed) continue;
    if (!HHMM.test(d.open) || !HHMM.test(d.close)) {
      return { error: `${dayNames[d.weekday]}: açılış ve kapanış saatini girin (ya da "Kapalı"yı işaretleyin).`, values };
    }
    if (toMinutes(d.open) >= toMinutes(d.close)) {
      return { error: `${dayNames[d.weekday]}: açılış saati kapanıştan önce olmalı.`, values };
    }
  }

  // 2) Yeni saatlerin dışında kalan randevular (şu andan sonrası)
  let upcoming: AdminAppointment[];
  try {
    upcoming = await getActiveAppointmentsBetween(new Date().toISOString());
  } catch (e) {
    unstable_rethrow(e);
    console.error("[panel] çalışma saati çakışma kontrolü:", e);
    return { error: "Kaydedilemedi. Lütfen tekrar deneyin.", values };
  }

  const conflicts = upcoming.filter((a) => {
    const d = values[weekdayOf(a.date)];
    const day = d.closed
      ? { closed: true, open: 0, close: 0 }
      : { closed: false, open: toMinutes(d.open), close: toMinutes(d.close) };
    return !fitsHours({ start: toMinutes(a.time), end: toMinutes(a.endTime) }, day);
  });

  if (conflicts.length > 0) {
    return {
      error: `Yeni saatlerin dışında kalan ${conflicts.length} randevu var. Önce müşterilerle konuşup bu randevuları iptal edin, sonra saatleri tekrar kaydedin.`,
      conflicts,
      values,
    };
  }

  // 3) Şu anki satırları oku, sadece değişenleri güncelle
  const { data: current, error: readError } = await supabase.from("working_hours").select("*");
  if (readError) {
    console.error(`[panel] çalışma saatleri okunamadı: ${readError.code} ${readError.message}`);
    return { error: "Kaydedilemedi. Lütfen tekrar deneyin.", values };
  }
  const byDay = new Map((current as WorkingHoursRow[]).map((r) => [r.weekday, r]));

  const changes = values.flatMap((d) => {
    const row = byDay.get(d.weekday);
    if (!row) return [];
    // Kapalı yapılan günün eski saatleri silinmez: tekrar açınca geri gelsin
    const next = d.closed
      ? { is_closed: true, open_time: row.open_time, close_time: row.close_time }
      : { is_closed: false, open_time: `${d.open}:00`, close_time: `${d.close}:00` };
    const same =
      row.is_closed === next.is_closed && row.open_time === next.open_time && row.close_time === next.close_time;
    return same ? [] : [{ weekday: d.weekday, ...next }];
  });

  if (changes.length === 0) return { saved: true };

  const results = await Promise.all(
    changes.map(({ weekday, ...cols }) =>
      supabase.from("working_hours").update(cols).eq("weekday", weekday).select("weekday"),
    ),
  );
  const failed = results.find((r) => r.error || !r.data?.length);
  if (failed) {
    console.error(`[panel] çalışma saati güncellenemedi: ${failed.error?.code} ${failed.error?.message}`);
    updateTag("working-hours"); // bazıları kaydolmuş olabilir
    refresh();
    return { error: "Bazı günler kaydedilemedi. Lütfen sayfayı kontrol edip tekrar deneyin.", values };
  }

  // 4) İletişim sayfası, footer ve rezervasyon takvimi yeni saatleri hemen görsün
  updateTag("working-hours");
  refresh();
  return { saved: true };
}
