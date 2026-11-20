"use server";
/*
 * SERVER ACTION: Formdaki "Randevuyu Oluştur" butonu bu fonksiyonu SUNUCUDA çalıştırır.
 *
 * GÜVENLİK: Bu fonksiyon dışarıya açık bir kapı gibidir. Birisi formu hiç
 * kullanmadan, istediği verilerle doğrudan çağırabilir. Bu yüzden tarayıcıdan
 * gelen HİÇBİR şeye güvenmiyoruz:
 *   1) Zod ile biçim kontrolü (ad, telefon, saat biçimi, onay kutusu)
 *   2) Saat gerçekten hâlâ boş mu? (getDaySlots: 1 saat önceden kuralı dahil)
 *   3) Son söz veritabanında: book_appointment her şeyi tekrar kontrol eder,
 *      exclusion constraint de aynı anda gelen iki isteği ayırır.
 */
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { getDaySlots } from "@/data/availability";
import { getServiceBySlug } from "@/data/services";
import { bookingErrorMessage, GENERIC, SLOT_UNAVAILABLE } from "@/lib/bookingErrors";
import { toIstanbulIso } from "@/lib/istanbulTime";
import { notifyNewBooking } from "@/lib/notify";
import { site } from "@/lib/site";
import { toMinutes } from "@/lib/slots";
import { isStaging, isTestBookingName } from "@/lib/staging";
import { supabase } from "@/lib/supabase";
import type { BookingState } from "./bookingState";

const phoneMessage = "Telefon numaranızı alan koduyla yazın (ör. 0532 123 45 67).";

const schema = z.object({
  islem: z.string(),
  tarih: z.iso.date(),
  time: z.string({ error: "Lütfen bir saat seçin." }).regex(/^\d{2}:\d{2}$/, "Lütfen bir saat seçin."),
  name: z
    .string()
    .trim()
    .min(2, "Adınız en az 2 harf olmalı.")
    .max(100, "Adınız en fazla 100 karakter olabilir."),
  // "0532 123 45 67" ya da "+90 (532)..." yazılabilir; rakam dışındakileri atıyoruz
  phone: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(z.string().min(10, phoneMessage).max(13, phoneMessage)),
  note: z.string().trim().max(500, "Not en fazla 500 karakter olabilir."),
  kvkk: z.literal("on", { error: "Devam etmek için onay kutusunu işaretleyin." }),
});

export async function bookAppointment(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const raw = Object.fromEntries(formData);

  // Hata olursa formu bu değerlerle geri dolduracağız (sadece müşterinin kendi ekranına gider)
  const values = {
    time: typeof raw.time === "string" ? raw.time : "",
    name: typeof raw.name === "string" ? raw.name : "",
    phone: typeof raw.phone === "string" ? raw.phone : "",
    note: typeof raw.note === "string" ? raw.note : "",
    kvkk: raw.kvkk === "on",
  };

  // Bal küpü doluysa bu bir bot: kaydetmiyoruz. Genel hata mesajı veriyoruz
  // (botu "yakaladık" diye uyarmaya gerek yok; çok nadiren bir insansa da
  // mesaj zaten "bizi arayın" diyor).
  if (typeof raw.website === "string" && raw.website !== "") {
    return { error: GENERIC, values };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }
  const { islem, tarih, time, name, phone, note } = parsed.data;

  // DENEME SÜRÜMÜ: adı "TEST" ile başlamayan randevu veritabanına
  // HİÇ gitmez. Kontrol sunucuda olduğu için tarayıcıdan atlatılamaz.
  // Gerçek açılışta SITE_STAGING silinince isStaging false olur, bu satır devreden çıkar.
  if (isStaging && !isTestBookingName(name)) {
    return {
      error: `Bu sitenin deneme sürümüdür, online randevu henüz alınmıyor. Randevu için lütfen bizi arayın${site.phone ? `: ${site.phone}` : "."}`,
      values,
    };
  }

  const service = await getServiceBySlug(islem);
  if (!service) return { error: "Bu işlem şu anda online randevuya açık değil.", values };

  // Ön kontrol: saat listede değilse veritabanına hiç gitmeyelim
  const slots = await getDaySlots(service.durationMin, tarih);
  if (!slots.includes(toMinutes(time))) {
    refresh(); // sayfadaki saat listesi güncellensin
    return { error: SLOT_UNAVAILABLE, values: { ...values, time: "" } };
  }

  const { data: bookingId, error } = await supabase.rpc("book_appointment", {
    p_service_id: service.id,
    p_starts_at: toIstanbulIso(tarih, toMinutes(time)), // "2026-11-24T13:15:00+03:00"
    p_customer_name: name,
    p_phone: phone,
    p_note: note,
    p_kvkk_consent: true,
  });

  if (error) {
    // En sık sebep: biri aynı saati bizden bir an önce aldı (23P01).
    // refresh() → saat listesi veritabanından yeniden okunur, dolan saat kaybolur.
    refresh();
    return { error: bookingErrorMessage(error), values: { ...values, time: "" } };
  }

  // Salon sahibine mail: after() → müşteriye cevap gittikten SONRA çalışır.
  // Müşteri, mail sunucusunun cevabını beklemek zorunda kalmaz; mail
  // gönderilemese bile müşterinin randevusu zaten kaydedildi.
  after(() =>
    notifyNewBooking({
      id: bookingId as number,
      serviceName: service.name,
      date: tarih,
      time,
      // ad, telefon, not BİLEREK yok (KVKK: e-postaya kişisel veri yazmıyoruz)
    }),
  );

  // Başarılı: onay sayfasına. URL'de kişisel veri YOK (ad/telefon yok).
  // redirect() bir hata fırlatarak çalışır → try/catch içine konmamalı.
  redirect(`/rezervasyon/tamam?islem=${islem}&tarih=${tarih}&saat=${time}`);
}
