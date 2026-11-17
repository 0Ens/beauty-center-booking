/*
 * ÖNCESİ / SONRASI: artık VERİTABANINDAN (Supabase → before_after tablosu) geliyor.
 * Örnek veriler supabase/seed.sql dosyasında. Görseller şimdilik "ÖRNEK GÖRSEL"
 * yazılı çizimler (public/ornek/).
 * Gerçek müşteri fotoğrafları ancak müşteriden YAZILI AÇIK RIZA alındıktan
 * sonra konabilir (KVKK: yüz fotoğrafı kişisel veridir).
 */
import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "@/lib/supabase";

/** Ekranda kullandığımız biçim (camelCase, kategorisi hazır) */
export type BeforeAfterEntry = {
  id: number;
  serviceSlug: string;
  category: string;
  title: string;
  description: string;
  takenOn: string; // "2026-10-01" gibi (yıl-ay-gün)
  before: string; // görsel yolu
  after: string;
  featured: boolean; // ana sayfada gösterilsin mi?
};

/** Veritabanından gelen satır (snake_case) + bağlı işlemden istediğimiz iki kolon */
type BeforeAfterRow = {
  id: number;
  title: string;
  description: string;
  taken_on: string;
  before_url: string;
  after_url: string;
  is_featured: boolean;
  services: { slug: string; category: string };
};

function toEntry(row: BeforeAfterRow): BeforeAfterEntry {
  return {
    id: row.id,
    serviceSlug: row.services.slug,
    category: row.services.category,
    title: row.title,
    description: row.description,
    takenOn: row.taken_on,
    before: row.before_url,
    after: row.after_url,
    featured: row.is_featured,
  };
}

/*
 * services!inner(slug, category):
 *   - services(...)  → yabancı anahtar (service_id) üzerinden bağlı işlemin
 *                      slug ve category kolonlarını da getir (JOIN).
 *   - !inner         → bağlı işlem görünmüyorsa (pasif → RLS gizledi) örneği
 *                      HİÇ getirme. (!inner olmasa örnek gelir, services: null olurdu.)
 *
 * cacheTag iki etiket alıyor: örnekler değişince ("before-after") VEYA bir işlemin
 * kategorisi / aktifliği değişince ("services") bu sonuç da tazelenmeli.
 */
export async function getBeforeAfterEntries(): Promise<BeforeAfterEntry[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("before-after", "services");

  const { data, error } = await supabase
    .from("before_after")
    .select("*, services!inner(slug, category)")
    .order("sort_order");

  if (error) throw new Error(`Öncesi/sonrası örnekleri yüklenemedi: ${error.message}`);
  return (data as BeforeAfterRow[]).map(toEntry);
}
