/*
 * ÇALIŞMA SAATLERİ: VERİTABANINDAN (Supabase → working_hours tablosu) geliyor.
 * Ekrana hazırlama (günleri birleştirme) src/lib/hours.ts dosyasında.
 */
import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/supabase";
import { toHoursLines, type HoursLine, type WorkingHoursRow } from "@/lib/hours";

export async function getHoursLines(): Promise<HoursLine[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("working-hours");

  const { data, error } = await supabase.from("working_hours").select("*").order("weekday");

  if (error) throw new Error(`Çalışma saatleri yüklenemedi: ${error.message}`);
  return toHoursLines(data as WorkingHoursRow[]);
}
