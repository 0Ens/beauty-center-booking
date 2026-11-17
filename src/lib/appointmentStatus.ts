/*
 * RANDEVU DURUMLARI VE GEÇİŞLERİ ("durum makinesi" / state machine)
 *
 * Bir randevu üç durumdan birinde: beklemede, onaylandı, iptal edildi.
 * Hangi durumdan hangisine geçilebileceği bir İŞ KURALI. Bu kuralı tek bir
 * yerde yazıyoruz; hem paneldeki düğmeler hem de Server Action buna bakıyor.
 * (Düğmeyi gizlemek yetmez: biri formu elle gönderebilir. Sunucu da kontrol eder.)
 *
 * Saf fonksiyonlar → src/lib/appointmentStatus.test.ts
 */
export const STATUSES = ["pending", "confirmed", "cancelled"] as const;
export type AppointmentStatus = (typeof STATUSES)[number];

/** Panelde görünen durum adı */
export const statusLabel: Record<AppointmentStatus, string> = {
  pending: "Onay bekliyor",
  confirmed: "Onaylandı",
  cancelled: "İptal edildi",
};

/** Bu duruma geçiren düğmenin yazısı */
export const actionLabel: Record<AppointmentStatus, string> = {
  pending: "Beklemeye al",
  confirmed: "Onayla",
  cancelled: "İptal et",
};

/**
 * Bu durumdaki bir randevu hangi durumlara geçirilebilir?
 * Kurallar proje sahibi tarafından belirlendi:
 *   - onaylanmış randevu beklemeye alınmaz, sadece iptal edilir
 *     (müşteriye "onaylandı" denmişse geri "beklemede"ye dönmek kafa karıştırır)
 *   - iptal edilen randevu geri alınabilir (müşteri "vazgeçtim, geliyorum" derse).
 *     O saat bu arada dolduysa veritabanı (0006) engeller.
 */
export function nextStatuses(current: AppointmentStatus): AppointmentStatus[] {
  switch (current) {
    case "pending":
      return ["confirmed", "cancelled"];
    case "confirmed":
      return ["cancelled"];
    case "cancelled":
      return ["confirmed"];
  }
}

/**
 * Tersinden soru: "target" durumuna HANGİ durumlardan gelinebilir?
 * Server Action güncellemeyi "id = X VE şu anki durum bunlardan biriyse" diye yapar.
 * Böylece kontrol ve değişiklik veritabanında TEK adımda olur (iki sekmeden aynı
 * anda basılsa bile geçersiz bir geçiş araya sızamaz).
 */
export function statusesThatCanBecome(target: AppointmentStatus): AppointmentStatus[] {
  return STATUSES.filter((from) => nextStatuses(from).includes(target));
}
