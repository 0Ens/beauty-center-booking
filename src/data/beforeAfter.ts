/*
 * ÖRNEK ÖNCESİ / SONRASI VERİLERİ
 * Görseller şimdilik "ÖRNEK GÖRSEL" yazılı çizimler (public/ornek/).
 * Gerçek müşteri fotoğrafları ancak müşteriden YAZILI AÇIK RIZA alındıktan
 * sonra konabilir (KVKK: yüz fotoğrafı kişisel veridir).
 * Aşama 3'te bu liste veritabanına taşınacak, fotoğrafları salon sahibi panelden yükleyecek.
 */
import { getServices } from "./services";

export type BeforeAfterItem = {
  id: string;
  serviceSlug: string; // hangi işleme ait → kategoriyi de buradan buluyoruz
  title: string;
  description: string;
  date: string; // "2026-10" gibi (yıl-ay)
  before: string; // görsel yolu
  after: string;
  featured: boolean; // ana sayfada gösterilsin mi?
};

export const beforeAfterItems: BeforeAfterItem[] = [
  {
    id: "akne-1",
    serviceSlug: "akne-bakimi",
    title: "Akne Bakımı",
    description: "6 seanslık bakım sonrası aktif sivilceler ve kızarıklık belirgin şekilde azaldı.",
    date: "2026-10",
    before: "/ornek/akne-oncesi.svg",
    after: "/ornek/akne-sonrasi.svg",
    featured: true,
  },
  {
    id: "leke-1",
    serviceSlug: "leke-karsiti-bakim",
    title: "Leke Karşıtı Bakım",
    description: "Güneş lekeleri açıldı, cilt tonu daha eşit bir görünüm kazandı.",
    date: "2026-09",
    before: "/ornek/leke-oncesi.svg",
    after: "/ornek/leke-sonrasi.svg",
    featured: true,
  },
  {
    id: "nem-1",
    serviceSlug: "nem-ve-isilti-bakimi",
    title: "Nem ve Işıltı Bakımı",
    description: "Tek seansta mat ve yorgun görünen cilde nem ve ışıltı kazandırıldı.",
    date: "2026-08",
    before: "/ornek/nem-oncesi.svg",
    after: "/ornek/nem-sonrasi.svg",
    featured: false,
  },
  {
    id: "kas-1",
    serviceSlug: "kas-laminasyonu",
    title: "Kaş Laminasyonu",
    description: "Seyrek ve dağınık kaşlar daha dolgun ve düzenli bir şekle kavuştu.",
    date: "2026-10",
    before: "/ornek/kas-oncesi.svg",
    after: "/ornek/kas-sonrasi.svg",
    featured: true,
  },
];

/** Ekranda gösterilen örnek: kategorisi de hesaplanmış hâli */
export type BeforeAfterEntry = BeforeAfterItem & { category: string };

/*
 * Bir örneğin kategorisi = ait olduğu işlemin kategorisi. İşlemler artık
 * veritabanında olduğu için bu hesap SUNUCUDA yapılıyor; tarayıcıdaki
 * bileşenlere (galeri, kaydırıcı) kategorisi hazır veri gönderiliyor.
 * (Tarayıcı kodu veritabanı bağlantısını import edemez.)
 */
export async function getBeforeAfterEntries(): Promise<BeforeAfterEntry[]> {
  const services = await getServices();
  return beforeAfterItems.map((item) => ({
    ...item,
    category: services.find((s) => s.slug === item.serviceSlug)?.category ?? "Diğer",
  }));
}
