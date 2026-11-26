/*
 * İZİN / TATİL GÜNLERİ: VERİTABANINDAN (Supabase → blocked_dates tablosu) geliyor.
 * Sadece tarihleri okuyoruz; "reason" sütunu ziyaretçilere kapalı (0005).
 */
import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { BlockedRange } from "@/lib/bookingDay";

export async function getBlockedRanges(): Promise<BlockedRange[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("blocked-dates"); // panelden izin eklenince bu etiket yenilenir

  const { data, error } = await supabase.from("blocked_dates").select("starts_on, ends_on");

  if (error) throw new Error(`İzin günleri yüklenemedi: ${error.message}`);
  return data.map((row) => ({ startsOn: row.starts_on, endsOn: row.ends_on }));
}
