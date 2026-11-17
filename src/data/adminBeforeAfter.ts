/*
 * PANEL: ÖNCESİ / SONRASI (tüm örnekler)
 * Ziyaretçi tarafı (beforeAfter.ts) önbellekten okur ve pasif işlemlerin
 * örneklerini gizler. Burası yöneticinin oturumuyla, önbelleksiz okur.
 */
import "server-only";
import { requireAdmin } from "@/lib/adminAuth";

export type AdminBeforeAfter = {
  id: number;
  serviceId: number;
  serviceName: string;
  serviceActive: boolean; // pasif işlemin örnekleri sitede hiç görünmez
  title: string;
  description: string;
  takenOn: string; // "2026-10-01"
  before: string;
  after: string;
  featured: boolean;
  sortOrder: number;
  consentConfirmed: boolean;
};

type Row = {
  id: number;
  service_id: number;
  title: string;
  description: string;
  taken_on: string;
  before_url: string;
  after_url: string;
  is_featured: boolean;
  sort_order: number;
  consent_confirmed: boolean;
  services: { name: string; is_active: boolean };
};

export async function getAllBeforeAfterForAdmin(): Promise<AdminBeforeAfter[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("before_after")
    .select(
      "id, service_id, title, description, taken_on, before_url, after_url, is_featured, sort_order, consent_confirmed, services(name, is_active)",
    )
    .order("sort_order")
    .order("id", { ascending: false }); // sıra eşitse YENİ önce (ana sayfayla aynı)
  if (error) throw new Error(`Öncesi/sonrası örnekleri yüklenemedi: ${error.message}`);

  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    serviceId: r.service_id,
    serviceName: r.services.name,
    serviceActive: r.services.is_active,
    title: r.title,
    description: r.description,
    takenOn: r.taken_on,
    before: r.before_url,
    after: r.after_url,
    featured: r.is_featured,
    sortOrder: r.sort_order,
    consentConfirmed: r.consent_confirmed,
  }));
}
