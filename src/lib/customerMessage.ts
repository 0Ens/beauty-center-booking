/*
 * PANELDEKİ "WHATSAPP" DÜĞMESİNİN HAZIR MESAJI
 * Salon sahibi düğmeye basınca WhatsApp bu metinle açılır; isterse değiştirip gönderir.
 * (Mesajı WhatsApp'ta salon sahibi gönderiyor; site kimseye kendiliğinden mesaj atmıyor.)
 *
 * Saf fonksiyon → src/lib/customerMessage.test.ts
 */
import type { AppointmentStatus } from "./appointmentStatus";
import { formatDayLong } from "./format";

export type MessageInput = {
  status: AppointmentStatus;
  customerName: string;
  serviceName: string;
  date: string; // "2026-11-24"
  time: string; // "14:00"
};

export function customerMessage(m: MessageInput, salonName: string): string {
  const when = `${formatDayLong(m.date)} saat ${m.time}`;
  switch (m.status) {
    case "confirmed":
      return `Merhaba ${m.customerName}, ${when} için ${m.serviceName} randevunuz onaylanmıştır. Görüşmek üzere! ${salonName}`;
    case "cancelled":
      return `Merhaba ${m.customerName}, ${when} için ${m.serviceName} randevunuz iptal edilmiştir. Yeni bir randevu için bize yazabilirsiniz. ${salonName}`;
    case "pending":
      return `Merhaba ${m.customerName}, ${when} için ${m.serviceName} randevu talebiniz hakkında yazıyorum. ${salonName}`;
  }
}
