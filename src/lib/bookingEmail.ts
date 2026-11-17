/*
 * SALON SAHİBİNE GİDEN "YENİ RANDEVU TALEBİ" E-POSTASININ METNİ
 *
 * KVKK — VERİ EN AZA İNDİRME:
 * E-posta Resend (ABD) üzerinden gidiyor ve salon sahibinin posta kutusunda duruyor.
 * Müşterinin ADI, TELEFONU ve NOTU bu yüzden e-postada YOK: bunlar sadece
 * veritabanında; salon sahibi yönetim panelinde görüyor. E-postadaki işlem + tarih +
 * randevu no tek başına kimseyi tanımlamadığı için kişisel veri sayılmaz.
 *
 * Düz metin (HTML değil): ileride müşterinin yazdığı bir şey eklenirse bile
 * HTML enjeksiyonu (sahte link) olamaz.
 *
 * Saf fonksiyonlar → src/lib/bookingEmail.test.ts ile test ediliyor.
 */
import { formatDayLong } from "./format";

export type BookingSummary = {
  id: number;
  serviceName: string;
  date: string; // "2026-11-24"
  time: string; // "15:00"
};

/** "Yeni randevu talebi: Kirpik Lifting – 24 Kasım 2026 Salı 15:00" */
export function bookingEmailSubject(b: BookingSummary): string {
  return `Yeni randevu talebi: ${b.serviceName} – ${formatDayLong(b.date)} ${b.time}`;
}

export function bookingEmailText(b: BookingSummary): string {
  return [
    "Siteden yeni bir randevu talebi geldi. Onayınızı bekliyor.",
    "",
    `İşlem:   ${b.serviceName}`,
    `Tarih:   ${formatDayLong(b.date)}`,
    `Saat:    ${b.time}`,
    `Randevu no: ${b.id}`,
    "",
    "Müşterinin adını ve telefonunu yönetim panelinin Randevular sayfasında görebilirsiniz.",
    "(Kişisel bilgiler güvenlik için e-postaya yazılmıyor.)",
  ].join("\n");
}
