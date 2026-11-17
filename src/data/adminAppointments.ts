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

// services(name): appointments.service_id üzerinden işlem adını da getir (JOIN)
const COLUMNS = "id, status, starts_at, ends_at, customer_name, phone, note, services(name)";

function toAdminAppointment(row: Row): AdminAppointment {
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
}

/** Panel listesi: bugün 00:00'dan (Türkiye) itibaren, iptal edilenler dahil */
export async function getUpcomingAppointments(): Promise<AdminAppointment[]> {
  const { supabase } = await requireAdmin();
  const { date: today } = nowInIstanbul();

  const { data, error } = await supabase
    .from("appointments")
    .select(COLUMNS)
    .gte("starts_at", toIstanbulIso(today, 0))
    .order("starts_at");

  if (error) throw new Error(`Randevular yüklenemedi: ${error.message}`);
  return (data as unknown as Row[]).map(toAdminAppointment);
}

/**
 * Çakışma kontrolleri için: [from, to) arasında başlayan, İPTAL EDİLMEMİŞ
 * (bekleyen veya onaylı) randevular. to verilmezse "from'dan sonraki hepsi".
 * Tarihler ISO metin: "2026-12-01T00:00:00+03:00"
 */
export async function getActiveAppointmentsBetween(from: string, to?: string): Promise<AdminAppointment[]> {
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("appointments")
    .select(COLUMNS)
    .in("status", ["pending", "confirmed"])
    .gte("starts_at", from);
  if (to) query = query.lt("starts_at", to);

  const { data, error } = await query.order("starts_at");
  if (error) throw new Error(`Randevular yüklenemedi: ${error.message}`);
  return (data as unknown as Row[]).map(toAdminAppointment);
}
