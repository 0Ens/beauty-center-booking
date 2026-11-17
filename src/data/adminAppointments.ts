/*
 * PANEL: BUGÜN VE SONRASI İÇİN RANDEVULAR
 *
 * Müşteri adı ve telefonu kişisel veri. Bu yüzden:
 *   - requireAdmin() önce "bu kişi yönetici mi?" diye bakar,
 *   - sorgu yöneticinin OTURUMUYLA yapılır (cookie'li istemci). Veritabanı da
 *     RLS ile ayrıca kontrol eder (0009: sadece is_admin() görebilir).
 *   - Önbelleğe ALINMAZ: her açılışta taze okunur (yeni talep hemen görünsün).
 */
import "server-only";
import { requireAdmin } from "@/lib/adminAuth";
import type { AppointmentStatus } from "@/lib/appointmentStatus";
import { inIstanbul, nowInIstanbul, toIstanbulIso } from "@/lib/istanbulTime";
import { toTime } from "@/lib/slots";

export type AdminAppointment = {
  id: number;
  status: AppointmentStatus;
  date: string; // "2026-11-24" (Türkiye günü)
  time: string; // "14:00"
  endTime: string; // "15:00"
  serviceName: string;
  customerName: string;
  phone: string; // sadece rakamlar
  note: string;
};

type Row = {
  id: number;
  status: AppointmentStatus;
  starts_at: string;
  ends_at: string;
  customer_name: string;
  phone: string;
  note: string | null;
  // İşlem sonradan pasif yapıldıysa RLS onu gizler → null gelir
  services: { name: string } | null;
};

export async function getUpcomingAppointments(): Promise<AdminAppointment[]> {
  const { supabase } = await requireAdmin();
  const { date: today } = nowInIstanbul();

  const { data, error } = await supabase
    .from("appointments")
    // services(name): appointments.service_id üzerinden işlem adını da getir (JOIN)
    .select("id, status, starts_at, ends_at, customer_name, phone, note, services(name)")
    .gte("starts_at", toIstanbulIso(today, 0)) // bugün 00:00'dan (Türkiye) itibaren
    .order("starts_at");

  if (error) throw new Error(`Randevular yüklenemedi: ${error.message}`);

  return (data as unknown as Row[]).map((row) => {
    const start = inIstanbul(row.starts_at);
    return {
      id: row.id,
      status: row.status,
      date: start.date,
      time: toTime(start.minutes),
      endTime: toTime(inIstanbul(row.ends_at).minutes),
      serviceName: row.services?.name ?? "(kaldırılmış işlem)",
      customerName: row.customer_name,
      phone: row.phone,
      note: row.note ?? "",
    };
  });
}
