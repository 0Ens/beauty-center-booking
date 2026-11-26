/*
 * SİTE AYARLARI — "tek doğruluk kaynağı" (single source of truth)
 *
 * Salona özel bütün metin ve iletişim bilgileri burada. Siteyi yeni bir salona
 * uyarlarken önce bu dosya değişir; renkler globals.css'teki, fontlar
 * app/layout.tsx'teki "MARKA AYARLARI" bloğunda, logo public/logo-mark.svg'de.
 * Ayrıntılı kontrol listesi: docs/YENI-MUSTERI.md
 *
 * Aşağıdaki değerler HAYALİ bir işletmeye ait (portföy demosu).
 * Boş ("") bırakılan alanlara bağlı öğeler (WhatsApp butonu, Instagram linki,
 * harita linki) sitede otomatik gizlenir.
 */
// Açık bir tip tanımlıyoruz. Bunun yerine "as const" kullansaydık TypeScript
// phone'un tipini tam olarak "" (boş metin) sanardı ve `site.phone && ...`
// kontrolünden sonraki kodu "asla çalışmaz" (never) diye işaretlerdi.
type SiteConfig = {
  name: string;
  /** KVKK metnindeki "veri sorumlusu": vergi levhasındaki resmi ad/unvan */
  legalName: string;
  shortName: string;
  description: string;
  /** Kısa tanıtım satırı: paylaşım görselinde ve ana sayfada, ör. "Cilt bakımı · Kaş ve kirpik" */
  tagline: string;
  /** Logodaki yazı: üstte el yazısı başlık, altta küçük büyük harfli alt yazı */
  logo: { title: string; subtitle: string };
  phone: string;
  whatsapp: string;
  instagram: string;
  /** Adresin parçaları (Google'a verilen işletme bilgisi bunları ayrı ayrı istiyor) */
  postalAddress: { street: string; postalCode: string; district: string; city: string };
  /** Ekranda görünen tek satırlık adres (postalAddress'ten üretiliyor) */
  address: string;
  mapsUrl: string;
  /** Hakkımızda sayfası */
  about: { greeting: string; heading: string; paragraphs: string[] };
  /** Yeni randevu e-postasında görünen gönderen adı */
  emailFromName: string;
  /** KVKK metnindeki "aktarım" bölümü: veritabanının bulunduğu yer ve siteyi barındıran firma */
  kvkk: { databaseLocation: string; hostingProvider: string };
  // Çalışma saatleri, işlemler, izin günleri veritabanında; panelden yönetiliyor.
};

// Adres tek yerde: hem ekrandaki satır hem Google'a giden parçalar buradan
const postalAddress = {
  street: "Örnek Mah. Demo Sk. No: 1",
  postalCode: "00000",
  district: "Merkez",
  city: "Örnekşehir",
};

export const site: SiteConfig = {
  name: "Demo Güzellik Merkezi",
  legalName: "Demo Güzellik Merkezi (hayali işletme)",
  shortName: "Demo Güzellik",
  description: "Demo Güzellik Merkezi: kişiye özel cilt bakımı, kaş ve kirpik uygulamaları. Online randevu alın.",
  tagline: "Cilt bakımı · Kaş ve kirpik",
  logo: { title: "Demo", subtitle: "Güzellik Merkezi" },

  /** Ekranda görünen telefon, ör. "0532 123 45 67" */
  phone: "0500 000 00 00",
  /** WhatsApp için ülke koduyla, boşluksuz: ör. "905321234567". Doluysa sağ altta WhatsApp butonu çıkar. */
  whatsapp: "",
  /** Sadece kullanıcı adı, ör. "salonadi.beauty" */
  instagram: "",
  postalAddress,
  address: `${postalAddress.street}, ${postalAddress.postalCode} ${postalAddress.district}/${postalAddress.city}`,
  /** Google Haritalar'daki "Paylaş" bağlantısı */
  mapsUrl: "",

  about: {
    greeting: "Merhaba, hoş geldiniz",
    heading: "Güzellik, iyi hissetmekle başlar",
    paragraphs: [
      "Salonumuzda her müşterimizi dinliyor, cildini tanıyor ve ona en uygun bakımı birlikte planlıyoruz.",
      "Amacımız sadece güzel görünmeniz değil, kendinizi iyi ve değerli hissetmeniz.",
      "(Bu bölüme salon sahibinin hikayesi, deneyimi ve aldığı eğitimler gelir.)",
    ],
  },

  emailFromName: "Demo Güzellik Randevu",

  // databaseLocation: Supabase projesinin bölgesi (Project Settings → General), cümle
  // içinde "...'in İrlanda'da (Dublin) bulunan sunucularında" diye okunur.
  kvkk: { databaseLocation: "İrlanda'da (Dublin)", hostingProvider: "Vercel Inc." },
};

export const navLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/islemlerimiz", label: "İşlemlerimiz" },
  { href: "/oncesi-sonrasi", label: "Öncesi & Sonrası" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
] as const;

export function whatsappLink(message = "Merhaba, randevu hakkında bilgi almak istiyorum.") {
  if (!site.whatsapp) return null;
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
