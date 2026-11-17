/*
 * SALON SAHİBİNE GİDEN "YENİ RANDEVU TALEBİ" E-POSTASININ METNİ
 *
 * Neden HTML değil düz metin?
 * Ad ve not alanlarını MÜŞTERİ yazıyor. HTML mail yapsaydık biri adına
 * <a href="kötü-site">Tıklayın</a> yazıp salon sahibinin mailine sahte bir link
 * koyabilirdi (HTML enjeksiyonu). Düz metinde her şey sadece yazı olarak görünür.
 *
 * Saf fonksiyonlar → src/lib/bookingEmail.test.ts ile test ediliyor.
 */
import { formatDayLong } from "./format";

export type BookingSummary = {
  id: number;
  serviceName: string;
  date: string; // "2026-11-24"
  time: string; // "15:00"
  name: string;
  phone: string; // sadece rakamlar: "05001234567"
  note: string;
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
    "",
    `Müşteri: ${b.name}`,
    `Telefon: ${b.phone}`,
    `Not:     ${b.note || "-"}`,
    "",
    `Randevu no: ${b.id}`,
  ].join("\n");
}
