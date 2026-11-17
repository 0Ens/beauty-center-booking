/*
 * VERİTABANI HATASI → MÜŞTERİYE GÖSTERİLECEK MESAJ
 *
 * book_appointment (0007) iki farklı yoldan hata verebilir:
 *   1) Bizim yazdığımız kontroller: raise exception 'in_past'
 *      → Supabase'den gelen hata: { code: "P0001", message: "in_past" }
 *   2) Çakışma: exclusion constraint'i Postgres kendisi kontrol eder
 *      → { code: "23P01", message: "conflicting key value violates exclusion constraint ..." }
 *
 * Yani bizim kodlarımız MESSAGE'da, çakışma ise CODE'da geliyor.
 * Saf fonksiyon → src/lib/bookingErrors.test.ts ile test ediliyor.
 */
export type DbError = { code?: string; message: string };

export const SLOT_TAKEN = "Bu saat az önce doldu. Lütfen aşağıdan başka bir saat seçin.";
export const SLOT_UNAVAILABLE = "Bu saat artık uygun değil. Lütfen aşağıdan başka bir saat seçin.";
export const GENERIC = "Randevu oluşturulamadı. Lütfen tekrar deneyin ya da bizi arayın.";

// Map kullanıyoruz: düz bir nesnede messages["toString"] gibi beklenmedik
// anahtarlar bile bir değer döndürürdü; Map'te sadece eklediklerimiz var.
const messages = new Map<string, string>([
  ["kvkk_required", "Devam etmek için onay kutusunu işaretleyin."],
  ["invalid_name", "Adınız 2 ile 100 karakter arasında olmalı."],
  ["invalid_phone", "Telefon numaranızı alan koduyla yazın (ör. 0532 123 45 67)."],
  ["note_too_long", "Not en fazla 500 karakter olabilir."],
  ["service_not_found", "Bu işlem şu anda online randevuya açık değil."],
  ["in_past", SLOT_UNAVAILABLE],
  ["too_far_ahead", "En fazla 60 gün sonrasına randevu alınabilir."],
  ["invalid_start", SLOT_UNAVAILABLE],
  ["outside_working_hours", SLOT_UNAVAILABLE],
  ["blocked_date", "Bu gün salonumuz kapalı. Lütfen başka bir gün seçin."],
]);

export function bookingErrorMessage(error: DbError): string {
  if (error.code === "23P01") return SLOT_TAKEN; // çakışma: Postgres'in kendi kodu
  return messages.get(error.message) ?? GENERIC; // bizim kodlarımız message'da; tanımadığımız → genel mesaj
}
