/*
 * Form ile Server Action arasında taşınan durum (useActionState).
 * "use server" dosyası sadece async fonksiyon dışa aktarabildiği için
 * tipler ve başlangıç değeri burada.
 */
export type BookingFieldName = "time" | "name" | "phone" | "note" | "kvkk";

export type BookingState = {
  error?: string; // formun üstünde gösterilen genel hata
  fieldErrors?: Partial<Record<BookingFieldName | "islem" | "tarih", string[]>>; // alanların altında
  values?: { time: string; name: string; phone: string; note: string; kvkk: boolean };
};

export const initialBookingState: BookingState = {};
