/*
 * SİTE AYARLARI — "tek doğruluk kaynağı" (single source of truth)
 * İsim, telefon, adres gibi bilgiler birçok sayfada geçiyor. Hepsini burada
 * tutuyoruz; bir bilgi değişince sadece bu dosyayı güncellemek yetiyor.
 *
 * TODO: Boş ("") alanları gerçek bilgilerle doldur.
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
  phone: string;
  whatsapp: string;
  instagram: string;
  /** Adresin parçaları (Google'a verilen işletme bilgisi bunları ayrı ayrı istiyor) */
  postalAddress: { street: string; postalCode: string; district: string; city: string };
  /** Ekranda görünen tek satırlık adres (postalAddress'ten üretiliyor) */
  address: string;
  mapsUrl: string;
  // Çalışma saatleri artık veritabanında (working_hours) → src/data/workingHours.ts
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
  // TODO (yayından önce): vergi levhasına göre kesinleştir (şahıs işletmesi mi, şirket mi?)
  legalName: "Demo Güzellik Merkezi (hayali işletme)",
  shortName: "Demo Güzellik",
  description:
    "Demo Güzellik Merkezi: kişiye özel cilt bakımı, kaş ve kirpik uygulamaları. Online randevu alın.",

  /** Ekranda görünen telefon, ör. "0532 123 45 67" */
  phone: "0500 000 00 00",
  /** WhatsApp için ülke koduyla, boşluksuz: ör. "905321234567". Doluysa sağ altta WhatsApp butonu çıkar. */
  whatsapp: "905000000000",
  /** Sadece kullanıcı adı, ör. "salonadibeauty" */
  instagram: "",
  postalAddress,
  address: `${postalAddress.street}, ${postalAddress.postalCode} ${postalAddress.district}/${postalAddress.city}`,
  /** Google Haritalar'daki "Paylaş" bağlantısı */
  mapsUrl: "",
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
