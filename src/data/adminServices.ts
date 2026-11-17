/*
 * PANEL: İŞLEMLER (pasifler dahil)
 * Ziyaretçi tarafı (services.ts) sadece aktifleri görür ve önbellekten okur.
 * Burası yöneticinin oturumuyla okur (0012: admin hepsini görür) ve önbelleğe
 * alınmaz: kaydettikten sonra hemen güncel hali görünsün.
 */
import "server-only";
import { toService, type Service, type ServiceRow } from "@/data/services";
import { requireAdmin } from "@/lib/adminAuth";

export type AdminService = Service & { isActive: boolean; sortOrder: number };

type AdminServiceRow = ServiceRow & { is_active: boolean; sort_order: number };

function toAdminService(row: AdminServiceRow): AdminService {
  return { ...toService(row), isActive: row.is_active, sortOrder: row.sort_order };
}

/** Tüm işlemler, sitedeki sırayla */
export async function getAllServicesForAdmin(): Promise<AdminService[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("services").select("*").order("sort_order").order("name");
  if (error) throw new Error(`İşlemler yüklenemedi: ${error.message}`);
  return (data as AdminServiceRow[]).map(toAdminService);
}
