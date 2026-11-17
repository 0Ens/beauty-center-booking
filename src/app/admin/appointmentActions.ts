"use server";
/*
 * RANDEVU ONAYLA / İPTAL ET (Server Action)
 *
 * Panel düğmeleri bunu çağırır. Ama bu fonksiyon internete açık bir kapı:
 * biri düğmeye hiç basmadan, istediği id ve durumla doğrudan çağırabilir.
 * Bu yüzden:
 *   1) requireAdmin(): giriş yapan kişi yönetici mi? (değilse yönlendirilir)
 *   2) Zod: id sayı mı, durum bildiğimiz üçünden biri mi?
 *   3) Geçiş kuralı (appointmentStatus.ts) güncellemenin İÇİNDE kontrol edilir
 *   4) Veritabanı son sözü söyler: RLS (sadece admin) + sadece status kolonu
 *      güncellenebilir (0009) + çakışma kuralı (0006)
 */
import { refresh } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { STATUSES, statusesThatCanBecome } from "@/lib/appointmentStatus";

export type StatusState = { error?: string };

const schema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(STATUSES),
});

export async function changeAppointmentStatus(_prev: StatusState, formData: FormData): Promise<StatusState> {
  const { supabase } = await requireAdmin();

  const parsed = schema.safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return { error: "Geçersiz istek." };
  const { id, status } = parsed.data;

  const allowedFrom = statusesThatCanBecome(status);
  if (allowedFrom.length === 0) return { error: "Bu değişiklik yapılamaz." };

  // "id'si X olan VE şu anki durumu izin verilenlerden biri olan randevuyu güncelle"
  // .select("id") → güncellenen satırları geri ver; boşsa hiçbir satır değişmemiştir.
  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .in("status", allowedFrom)
    .select("id");

  if (error) {
    // 23P01: çakışma kuralı (0006). İptal edilmiş bir randevu geri alınırken
    // o saate bu arada başka biri randevu almış olabilir.
    if (error.code === "23P01") {
      return { error: "Bu saatte başka bir randevu var. Önce onu iptal etmeniz gerekir." };
    }
    console.error(`[panel] randevu #${id} güncellenemedi: ${error.code} ${error.message}`);
    return { error: "Kaydedilemedi. Lütfen tekrar deneyin." };
  }

  refresh(); // panel listesi yeni durumla yeniden çizilsin

  if (!data || data.length === 0) {
    // Başka bir sekmede/telefonda zaten değiştirilmiş olabilir
    return { error: "Bu randevunun durumu değişmiş. Liste yenilendi." };
  }
  return {};
}
