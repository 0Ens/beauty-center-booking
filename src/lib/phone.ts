/*
 * TELEFON NUMARASI BİÇİMLERİ (panelde "ara" ve "WhatsApp" düğmeleri için)
 *
 * Rezervasyon formu numarayı sadece rakam olarak kaydediyor (10–13 hane).
 * Müşteri "0532...", "532..." ya da "+90 532..." yazmış olabilir.
 * WhatsApp ise ülke koduyla, başında 0 ve + olmadan ister: "905321234567".
 *
 * Saf fonksiyonlar → src/lib/phone.test.ts
 */

/** Türkiye cep/sabit numarası → "905321234567". Tanınmayan biçimde null (link gösterilmez). */
export function toInternational(digits: string): string | null {
  const d = digits.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("90")) return d; // 90 532 123 45 67
  if (d.length === 11 && d.startsWith("0")) return `9${d}`; // 0532 123 45 67
  if (d.length === 10 && !d.startsWith("0")) return `90${d}`; // 532 123 45 67
  return null;
}

/** Ekranda okunaklı göster: "05321234567" → "0532 123 45 67". Tanınmazsa olduğu gibi. */
export function formatPhone(digits: string): string {
  const intl = toInternational(digits);
  if (!intl) return digits;
  const local = `0${intl.slice(2)}`; // "05321234567"
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7, 9)} ${local.slice(9)}`;
}
