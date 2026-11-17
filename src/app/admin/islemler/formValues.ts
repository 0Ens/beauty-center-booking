/*
 * Veritabanındaki işlem → formdaki metin değerleri (ve boş form).
 * "Yeni işlem" ve "Düzenle" sayfaları ortak kullanıyor.
 */
import type { AdminService } from "@/data/adminServices";
import type { ServiceFormValues } from "./actions";

export function toFormValues(s: AdminService): ServiceFormValues {
  return {
    name: s.name,
    category: s.category,
    durationMin: String(s.durationMin),
    priceMin: s.priceMin === null ? "" : String(s.priceMin),
    priceMax: s.priceMax === null ? "" : String(s.priceMax),
    summary: s.summary,
    description: s.description,
    suitableFor: s.suitableFor.join("\n"),
    icon: s.icon,
    featured: s.featured,
    sortOrder: String(s.sortOrder),
  };
}

/** Yeni işlem: sıra, listenin sonuna gelecek şekilde önerilir */
export function emptyFormValues(nextSortOrder: number): ServiceFormValues {
  return {
    name: "",
    category: "",
    durationMin: "60",
    priceMin: "",
    priceMax: "",
    summary: "",
    description: "",
    suitableFor: "",
    icon: "sparkles",
    featured: false,
    sortOrder: String(nextSortOrder),
  };
}

export function categoriesOf(services: AdminService[]): string[] {
  return [...new Set(services.map((s) => s.category))].sort((a, b) => a.localeCompare(b, "tr"));
}
