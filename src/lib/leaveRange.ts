/*
 * İZİN ARALIĞI KONTROLÜ
 * Salon sahibi panelden "şu tarihten şu tarihe izinliyim" der. Kaydetmeden önce
 * tarihler mantıklı mı diye bakarız. Sorun varsa Türkçe hata mesajı,
 * yoksa null döner.
 *
 * Saf fonksiyon → src/lib/leaveRange.test.ts (beklenen davranış orada yazılı)
 *
 * İPUCU: "2026-11-24" biçimindeki tarihler (yıl-ay-gün, hep aynı uzunlukta)
 * METİN olarak karşılaştırılabilir: "2026-11-24" < "2026-12-01" → true.
 * Yıl önde olduğu için alfabetik sıra = takvim sırası.
 */
import { addDays } from "./bookingDay";

/** Yazım hatalarını yakalamak için (ör. 2026 yerine 2027 yazmak) */
export const MAX_LEAVE_DAYS = 60;

type LeaveInput = {
  startsOn: string; // "2026-12-01"
  endsOn: string; // "2026-12-03" (tek günlük izinde startsOn ile aynı)
  today: string; // Türkiye'de bugün
};

// Kurallar proje sahibi tarafından yazıldı
export function leaveRangeError({ startsOn, endsOn, today }: LeaveInput): string | null {
  // 1) Ters sıra
  if (endsOn < startsOn) return "Bitiş tarihi başlangıç tarihinden önce olamaz.";
  // 2) Geçmiş tarih
  if (startsOn < today) return "Geçmiş bir tarihe izin eklenemez.";
  // 3) Çok uzun: iki uç dahil olduğu için en geç bitiş = başlangıç + (MAX - 1) gün
  if (endsOn > addDays(startsOn, MAX_LEAVE_DAYS - 1)) return `İzin en fazla ${MAX_LEAVE_DAYS} gün olabilir.`;
  return null;
}
