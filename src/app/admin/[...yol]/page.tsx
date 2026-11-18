import { notFound } from "next/navigation";

/*
 * PANELDE EŞLEŞMEYEN ADRESLERİ YAKALA
 *
 * Sorun: /admin/abc gibi HİÇ OLMAYAN bir adres, Next'in kural gereği doğrudan
 * KÖK 404'e (app/not-found.tsx) gidiyordu. O sayfada sitenin menüsü ve
 * "Ana Sayfaya Dön" var → yönetici panelden müşteri sitesine düşüyordu.
 *
 * Çözüm: [...yol] "catch-all" klasörü; /admin altında başka hiçbir sayfayla
 * eşleşmeyen her adres (/admin/abc, /admin/islemler/x/y ...) buraya gelir.
 * Tek işi notFound() çağırmak → en yakın not-found.tsx, yani
 * admin/not-found.tsx gösterilir: panelin kendi düzeni ve "Panele Dön".
 *
 * Gerçek sayfalar (/admin/islemler, /admin/giris ...) her zaman önce eşleşir;
 * Next sabit adları [...yol] gibi geniş kalıplara tercih eder.
 * Proxy de bu adresleri korur: giriş yapmamış biri önce giriş sayfasına gider.
 */

// Next 16 geliştirmede her sayfayı "tıklayınca anında açılır mı?" diye
// render edip dener (instant validation). Bu sayfa HER ZAMAN notFound()
// fırlattığı için render edilemez → "Could not validate instant" uyarısı.
// Hız ölçülecek bir içerik yok; doğrulamadan çıkarıyoruz (Next de kendi
// /_not-found sayfasını aynı sebeple muaf tutuyor).
export const instant = false;

export default function AdminCatchAll() {
  notFound();
}
