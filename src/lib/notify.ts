/*
 * YENİ RANDEVU BİLDİRİMİ (Resend ile e-posta)
 *
 * import "server-only": Bu dosya yanlışlıkla bir tarayıcı bileşenine import
 * edilirse build HATA verir. Böylece RESEND_API_KEY asla tarayıcıya gitmez.
 * (Anahtar NEXT_PUBLIC_ ile başlamadığı için zaten gönderilmezdi; bu ikinci kilit.)
 *
 * Mail gönderilemezse randevu İPTAL OLMAZ: kayıt veritabanında güvende,
 * salon sahibi panelden de görecek. Sadece hatayı sunucu kaydına (log) yazıyoruz.
 * Log'a kişisel veri (ad, telefon) yazmıyoruz, sadece randevu no.
 */
import "server-only";
import { Resend } from "resend";
import { bookingEmailSubject, bookingEmailText, type BookingSummary } from "./bookingEmail";

// Kendi alan adımızı doğrulayana kadar (Aşama 7) Resend'in test adresinden gönderiyoruz.
// Bu adresle mail SADECE Resend hesabını açan e-postaya gidebilir.
const DEFAULT_FROM = "Demo Güzellik Randevu <onboarding@resend.dev>";

export async function notifyNewBooking(booking: BookingSummary): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_NOTIFY_TO;

  if (!apiKey || !to) {
    console.warn(`[randevu-maili] RESEND_API_KEY ya da BOOKING_NOTIFY_TO eksik; #${booking.id} için mail gönderilmedi`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.BOOKING_NOTIFY_FROM || DEFAULT_FROM,
      to,
      subject: bookingEmailSubject(booking),
      text: bookingEmailText(booking),
    });
    if (error) console.error(`[randevu-maili] #${booking.id} gönderilemedi: ${error.message}`);
  } catch (err) {
    console.error(`[randevu-maili] #${booking.id} gönderilemedi:`, err instanceof Error ? err.message : err);
  }
}
