"use server";
/*
 * İZİN GÜNÜ EKLE / SİL (Server Actions)
 *
 * Ekleme kuralı:
 *   İzin tarihlerinde bekleyen veya onaylı randevu varsa izin EKLENMEZ.
 *   Salon sahibi önce o müşterilere haber verip randevuları iptal eder.
 *   (Kendiliğinden iptal yok: müşteriye mesajı site değil salon sahibi gönderiyor.)
 *
 * Not: Kontrol ile kayıt arasında çok kısa bir an var; tam o anda biri randevu
 * alırsa ikisi birden kaydolabilir. Tek kişilik bir salon için bu risk çok küçük
 * ve o randevu yine panelde görünür. (Tam garanti için ikisi tek bir SQL
 * fonksiyonunda kilitle yapılırdı.)
 */
import { refresh, updateTag } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { getActiveAppointmentsBetween, type AdminAppointment } from "@/data/adminAppointments";
import { requireAdmin } from "@/lib/adminAuth";
import { addDays } from "@/lib/bookingDay";
import { DEMO_LOCKED_MESSAGE } from "@/lib/demoAdmin";
import { nowInIstanbul, toIstanbulIso } from "@/lib/istanbulTime";
import { leaveRangeError } from "@/lib/leaveRange";

export type AddLeaveState = {
  error?: string;
  conflicts?: AdminAppointment[];
  saved?: boolean;
  // Hata olursa form boşalmasın diye girilen değerleri geri gönderiyoruz
  values?: { startsOn: string; endsOn: string; reason: string };
};

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const addSchema = z.object({
  startsOn: isoDate,
  // Tek günlük izinde bitiş boş bırakılabilir → başlangıçla aynı gün sayılır
  endsOn: z.union([isoDate, z.literal("")]),
  reason: z.string().trim().max(200),
});

export async function addBlockedRange(_prev: AddLeaveState, formData: FormData): Promise<AddLeaveState> {
  const { supabase, isDemoAccount } = await requireAdmin();

  const raw = {
    startsOn: String(formData.get("startsOn") ?? ""),
    endsOn: String(formData.get("endsOn") ?? ""),
    reason: String(formData.get("reason") ?? ""),
  };
  if (isDemoAccount) return { error: DEMO_LOCKED_MESSAGE, values: raw };

  const parsed = addSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Başlangıç tarihini seçin. Not en fazla 200 karakter olabilir.", values: raw };
  }
  const startsOn = parsed.data.startsOn;
  const endsOn = parsed.data.endsOn || startsOn;
  const reason = parsed.data.reason;
  const values = { startsOn, endsOn, reason };

  const rangeError = leaveRangeError({ startsOn, endsOn, today: nowInIstanbul().date });
  if (rangeError) return { error: rangeError, values };

  // Bu günlerde bekleyen/onaylı randevu var mı?
  // [başlangıç günü 00:00, bitişten SONRAKİ gün 00:00) aralığında başlayan randevular
  let conflicts: AdminAppointment[];
  try {
    conflicts = await getActiveAppointmentsBetween(toIstanbulIso(startsOn, 0), toIstanbulIso(addDays(endsOn, 1), 0));
  } catch (e) {
    // Oturum düşmüşse requireAdmin redirect() fırlatır; onu yutmayıp Next'e geri ver
    unstable_rethrow(e);
    console.error("[panel] izin çakışma kontrolü:", e);
    return { error: "Kaydedilemedi. Lütfen tekrar deneyin.", values };
  }

  if (conflicts.length > 0) {
    return {
      error: `Bu tarihlerde ${conflicts.length} randevu var. Önce müşterilere haber verip randevuları iptal edin, sonra izni tekrar ekleyin.`,
      conflicts,
      values,
    };
  }

  const { error } = await supabase
    .from("blocked_dates")
    .insert({ starts_on: startsOn, ends_on: endsOn, reason: reason || null });

  if (error) {
    console.error(`[panel] izin eklenemedi: ${error.code} ${error.message}`);
    return { error: "Kaydedilemedi. Lütfen tekrar deneyin.", values };
  }

  // Ziyaretçi tarafındaki önbelleği HEMEN sil: rezervasyon takviminde bu günler
  // hemen kapalı görünsün (revalidateTag olsaydı bir süre eski hali görülebilirdi)
  updateTag("blocked-dates");
  refresh(); // panel listesi yenilensin
  return { saved: true };
}

export type DeleteLeaveState = { error?: string };

export async function deleteBlockedRange(_prev: DeleteLeaveState, formData: FormData): Promise<DeleteLeaveState> {
  const { supabase, isDemoAccount } = await requireAdmin();
  if (isDemoAccount) return { error: DEMO_LOCKED_MESSAGE };

  const parsed = z.coerce.number().int().positive().safeParse(formData.get("id"));
  if (!parsed.success) return { error: "Geçersiz istek." };

  const { error } = await supabase.from("blocked_dates").delete().eq("id", parsed.data);
  if (error) {
    console.error(`[panel] izin silinemedi: ${error.code} ${error.message}`);
    return { error: "Silinemedi. Lütfen tekrar deneyin." };
  }

  updateTag("blocked-dates");
  refresh();
  return {};
}
