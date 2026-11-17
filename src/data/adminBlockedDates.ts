/*
 * PANEL: İZİN GÜNLERİ (sebebiyle birlikte)
 * Ziyaretçi tarafı (blockedDates.ts) sebebi okuyamaz; burası yöneticinin
 * oturumuyla okur ve sebebi de görür (0010: sadece is_admin()).
 * Önbelleğe alınmaz: ekle/sil sonrası hemen güncel görünsün.
 */
import "server-only";
import { requireAdmin } from "@/lib/adminAuth";
import { nowInIstanbul } from "@/lib/istanbulTime";

export type AdminBlockedRange = {
  id: number;
  startsOn: string;
  endsOn: string;
  reason: string;
};

/** Bitmemiş izinler (bugün süren ve ileride olanlar) */
export async function getUpcomingBlockedRanges(): Promise<AdminBlockedRange[]> {
  const { supabase } = await requireAdmin();
  const { date: today } = nowInIstanbul();

  const { data, error } = await supabase
    .from("blocked_dates")
    .select("id, starts_on, ends_on, reason")
    .gte("ends_on", today)
    .order("starts_on");

  if (error) throw new Error(`İzin günleri yüklenemedi: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    reason: row.reason ?? "",
  }));
}
