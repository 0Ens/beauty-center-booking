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
  shortName: string;
  description: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
  mapsUrl: string;
  hours: { days: string; time: string }[];
};

export const site: SiteConfig = {
  name: "Demo Güzellik Merkezi",
  shortName: "Demo Güzellik",
  description:
    "Demo Güzellik Merkezi: kişiye özel cilt bakımı, kaş ve kirpik uygulamaları. Online randevu alın.",

  /** Ekranda görünen telefon, ör. "0532 123 45 67" */
  phone: "0500 000 00 00",
  /** WhatsApp için ülke koduyla, boşluksuz: ör. "905321234567". Doluysa sağ altta WhatsApp butonu çıkar. */
  whatsapp: "905000000000",
  /** Sadece kullanıcı adı, ör. "salonadibeauty" */
  instagram: "",
  address: "Örnek Mah. Demo Sk. No: 1, 00000 Merkez/Örnekşehir",
  /** Google Haritalar'daki "Paylaş" bağlantısı */
  mapsUrl: "",

  hours: [
    { days: "Pazartesi – Cumartesi", time: "10:00 – 19:00" },
    { days: "Pazar", time: "Kapalı" },
  ],
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
