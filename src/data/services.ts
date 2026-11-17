/*
 * İŞLEMLER: artık VERİTABANINDAN (Supabase → services tablosu) geliyor.
 * Örnek veriler supabase/seed.sql dosyasında. Salon sahibi ileride panelden düzenleyecek.
 */
import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/supabase";

const iconNames = ["droplets", "sparkles", "leaf", "sun", "flower", "eye"] as const;
export type ServiceIconName = (typeof iconNames)[number];

/** Sitede kullandığımız biçim (camelCase) */
export type Service = {
  id: number; // randevu kaydederken veritabanına bu gönderilir
  slug: string; // URL'de görünen ad: /islemlerimiz/derin-cilt-temizligi
  name: string;
  category: string;
  durationMin: number;
  summary: string; // kartlarda görünen kısa açıklama
  description: string; // detay sayfasındaki uzun açıklama
  suitableFor: string[];
  icon: ServiceIconName;
  featured: boolean; // ana sayfada gösterilsin mi?
  priceMin: number | null; // null = "fiyat için arayın"
  priceMax: number | null;
};

/** Veritabanından gelen satırın biçimi (snake_case, SQL'deki sütun adları) */
type ServiceRow = {
  id: number;
  slug: string;
  name: string;
  category: string;
  duration_min: number;
  summary: string;
  description: string;
  suitable_for: string[];
  icon: string;
  featured: boolean;
  price_min: number | null;
  price_max: number | null;
};

// Veritabanında icon sadece bir "text". Biri panelden tanımadığımız bir değer
// girerse site çökmesin diye kontrol ediyoruz.
function isIconName(value: string): value is ServiceIconName {
  return (iconNames as readonly string[]).includes(value);
}

/** Satır (snake_case) → sitedeki biçim (camelCase) */
function toService(row: ServiceRow): Service {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    durationMin: row.duration_min,
    summary: row.summary,
    description: row.description,
    suitableFor: row.suitable_for,
    icon: isIconName(row.icon) ? row.icon : "sparkles",
    featured: row.featured,
    priceMin: row.price_min,
    priceMax: row.price_max,
  };
}

/*
 * "use cache": Bu fonksiyonun SONUCU saklanır. Her ziyaretçi için
 * veritabanına tekrar gitmek yerine saklanan liste kullanılır → sayfa çok
 * hızlı açılır ve ücretsiz plandaki istek kotasını harcamayız.
 *
 * cacheLife("hours"): sonuç en geç ~1 saatte bir tazelenir.
 * cacheTag("services"): bu saklanan sonuca bir etiket veriyoruz. Aşama 5'te
 * salon sahibi panelden bir işlemi değiştirince "services etiketli her şeyi
 * yenile" diyeceğiz → değişiklik 1 saat beklemeden anında sitede görünecek.
 */
export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("services");

  // Senin yazdığın sorgu 👇
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  // Veritabanına ulaşılamazsa sessizce boş liste göstermek yerine hata ver:
  // boş bir "İşlemlerimiz" sayfası, hatadan daha yanıltıcı olurdu.
  if (error) throw new Error(`İşlemler yüklenemedi: ${error.message}`);

  return (data as ServiceRow[]).map(toService);
}

export async function getServiceBySlug(slug: string) {
  const services = await getServices();
  return services.find((service) => service.slug === slug);
}

export async function getFeaturedServices() {
  const services = await getServices();
  return services.filter((service) => service.featured);
}

export async function getServiceCategories() {
  const services = await getServices();
  return [...new Set(services.map((service) => service.category))];
}
