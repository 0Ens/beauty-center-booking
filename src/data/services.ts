/*
 * ÖRNEK İŞLEM VERİLERİ
 * Bunlar tasarımı görebilmek için konmuş geçici veriler. Salon sahibinin gerçek
 * işlem listesiyle değiştirilecek. Aşama 3'te bu veriler veritabanına
 * (Supabase) taşınacak; o zaman salon sahibi panelden kendisi düzenleyebilecek.
 */
export type ServiceIconName = "droplets" | "sparkles" | "leaf" | "sun" | "flower" | "eye";

export type Service = {
  slug: string; // URL'de görünen ad: /islemlerimiz/derin-cilt-temizligi
  name: string;
  category: string;
  durationMin: number;
  summary: string; // kartlarda görünen kısa açıklama
  description: string; // detay sayfasındaki uzun açıklama
  suitableFor: string[];
  icon: ServiceIconName;
  featured: boolean; // ana sayfada gösterilsin mi?
};

export const services: Service[] = [
  {
    slug: "derin-cilt-temizligi",
    name: "Derin Cilt Temizliği",
    category: "Cilt Bakımı",
    durationMin: 75,
    summary: "Gözenekleri arındıran, cildin nefes almasını sağlayan temel bakım.",
    description:
      "Cilt analizinin ardından cildinize uygun ürünlerle temizlik, peeling, gözenek temizliği ve maske uygulanır. Bakım sonunda cildiniz daha temiz, pürüzsüz ve canlı görünür.",
    suitableFor: [
      "Yağlı ve karma ciltler",
      "Siyah nokta ve gözenek sorunu yaşayanlar",
      "Mat ve yorgun görünen ciltler",
    ],
    icon: "droplets",
    featured: true,
  },
  {
    slug: "nem-ve-isilti-bakimi",
    name: "Nem ve Işıltı Bakımı",
    category: "Cilt Bakımı",
    durationMin: 60,
    summary: "Susuz kalmış cilde nem ve doğal bir ışıltı kazandırır.",
    description:
      "Yoğun nem veren serum ve maskelerle cildin nem dengesi desteklenir. Özel günler öncesinde ya da mevsim geçişlerinde tercih edilen rahatlatıcı bir bakımdır.",
    suitableFor: ["Kuru ve susuz ciltler", "Özel gün öncesi ışıltı isteyenler"],
    icon: "sparkles",
    featured: true,
  },
  {
    slug: "akne-bakimi",
    name: "Akne Bakımı",
    category: "Cilt Bakımı",
    durationMin: 60,
    summary: "Sivilceye eğilimli ciltler için dengeleyici ve arındırıcı bakım.",
    description:
      "Akneye eğilimli ciltler için yatıştırıcı ve dengeleyici ürünlerle yapılan bir bakımdır. Düzenli seanslar ve evde bakım önerileriyle desteklenir.",
    suitableFor: ["Sivilceye eğilimli ciltler", "Ergenlik dönemi ciltleri"],
    icon: "leaf",
    featured: true,
  },
  {
    slug: "leke-karsiti-bakim",
    name: "Leke Karşıtı Bakım",
    category: "Cilt Bakımı",
    durationMin: 60,
    summary: "Cilt tonunu eşitlemeye yardımcı, aydınlatıcı bakım.",
    description:
      "Aydınlatıcı içeriklerle yapılan bu bakım, daha eşit görünen bir cilt tonunu hedefler. Güneş koruması ve evde bakım önerileriyle birlikte uygulanır.",
    suitableFor: ["Güneş ve yaş lekesi olanlar", "Cilt tonu eşitsizliği yaşayanlar"],
    icon: "sun",
    featured: false,
  },
  {
    slug: "kas-laminasyonu",
    name: "Kaş Laminasyonu",
    category: "Kaş & Kirpik",
    durationMin: 45,
    summary: "Kaşlara düzenli, dolgun ve şekilli bir görünüm kazandırır.",
    description:
      "Kaş kılları istenen yöne sabitlenerek daha dolgun ve düzenli bir görünüm elde edilir. Uygulama sonrasında kaşlarınız haftalarca şeklini korur.",
    suitableFor: ["Dağınık ya da seyrek kaşları olanlar", "Bakımlı ve doğal görünüm isteyenler"],
    icon: "flower",
    featured: true,
  },
  {
    slug: "kirpik-lifting",
    name: "Kirpik Lifting",
    category: "Kaş & Kirpik",
    durationMin: 60,
    summary: "Kendi kirpiklerinize kalıcı bir kıvrım ve canlılık verir.",
    description:
      "Kirpikler kökten kıvrılarak daha uzun ve belirgin görünmesi sağlanır. Takma kirpik ya da her gün kirpik kıvırıcı kullanmadan doğal bir görünüm sunar.",
    suitableFor: ["Düz kirpikleri olanlar", "Makyajsız da bakımlı görünmek isteyenler"],
    icon: "eye",
    featured: true,
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}

export const featuredServices = services.filter((service) => service.featured);

export const serviceCategories = [...new Set(services.map((service) => service.category))];
