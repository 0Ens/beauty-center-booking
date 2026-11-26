"use server";
/*
 * İŞLEM EKLE / DÜZENLE / PASİFE AL (Server Actions)
 *
 * Silme yok (0012): eski randevular ve öncesi/sonrası örnekleri işleme bağlı.
 * Onun yerine pasife alma: işlem sitede ve rezervasyonda görünmez,
 * alınmış randevular olduğu gibi kalır.
 *
 * Kaydedince updateTag("services"): işlem listesi, detay sayfası, ana sayfa
 * ve rezervasyon formu yeni hali HEMEN görür (öncesi/sonrası galerisi de bu
 * etiketi dinliyor, bkz. data/beforeAfter.ts).
 */
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { iconNames } from "@/components/serviceIcons";
import { requireAdmin } from "@/lib/adminAuth";
import { DEMO_LOCKED_MESSAGE } from "@/lib/demoAdmin";
import { priceRangeError, slugify } from "@/lib/serviceRules";

/** Formdaki değerler (hata olursa form bu haliyle geri gelir) */
export type ServiceFormValues = {
  name: string;
  category: string;
  durationMin: string;
  priceMin: string;
  priceMax: string;
  summary: string;
  description: string;
  suitableFor: string; // her satır bir madde
  icon: string;
  featured: boolean;
  sortOrder: string;
};

export type ServiceState = { error?: string; saved?: boolean; values?: ServiceFormValues };

function readForm(formData: FormData): ServiceFormValues {
  const s = (key: string) => String(formData.get(key) ?? "");
  return {
    name: s("name"),
    category: s("category"),
    durationMin: s("durationMin"),
    priceMin: s("priceMin"),
    priceMax: s("priceMax"),
    summary: s("summary"),
    description: s("description"),
    suitableFor: s("suitableFor"),
    icon: s("icon"),
    featured: formData.get("featured") === "on",
    sortOrder: s("sortOrder"),
  };
}

// Boş fiyat → null ("fiyat için arayın"); doluysa 0 veya pozitif tam sayı
const price = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v)))
  .refine((v) => v === null || (Number.isInteger(v) && v >= 0 && v <= 1_000_000), "Fiyat 0 veya pozitif bir tam sayı olmalı.");

const schema = z.object({
  name: z.string().trim().min(2, "İşlem adını girin.").max(80, "İşlem adı en fazla 80 karakter olabilir."),
  category: z.string().trim().min(2, "Kategori girin.").max(40, "Kategori en fazla 40 karakter olabilir."),
  durationMin: z.coerce
    .number("Süreyi dakika olarak girin.")
    .int("Süre tam sayı olmalı.")
    .min(5, "Süre en az 5 dakika olmalı.")
    .max(480, "Süre en fazla 480 dakika (8 saat) olabilir."),
  priceMin: price,
  priceMax: price,
  summary: z.string().trim().min(10, "Kısa açıklama en az 10 karakter olmalı.").max(200, "Kısa açıklama en fazla 200 karakter olabilir."),
  description: z.string().trim().min(20, "Açıklama en az 20 karakter olmalı.").max(3000, "Açıklama en fazla 3000 karakter olabilir."),
  // Her satır bir madde; boş satırlar atılır
  suitableFor: z
    .string()
    .transform((v) => v.split("\n").map((line) => line.trim()).filter(Boolean))
    .refine((items) => items.length <= 10, "En fazla 10 madde yazılabilir.")
    .refine((items) => items.every((i) => i.length <= 120), "Her madde en fazla 120 karakter olabilir."),
  icon: z.enum(iconNames, "Bir ikon seçin."),
  featured: z.boolean(),
  sortOrder: z.coerce.number("Sıra bir sayı olmalı.").int("Sıra tam sayı olmalı.").min(0, "Sıra 0 veya daha büyük olmalı.").max(999, "Sıra en fazla 999 olabilir."),
});

/** Ekleme ve düzenleme aynı form; gizli "id" alanı boşsa yeni işlem */
export async function saveService(_prev: ServiceState, formData: FormData): Promise<ServiceState> {
  const { supabase, isDemoAccount } = await requireAdmin();
  const values = readForm(formData);
  if (isDemoAccount) return { error: DEMO_LOCKED_MESSAGE, values };

  const parsed = schema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };
  const d = parsed.data;

  const priceError = priceRangeError(d.priceMin, d.priceMax);
  if (priceError) return { error: priceError, values };

  const cols = {
    name: d.name,
    category: d.category,
    duration_min: d.durationMin,
    price_min: d.priceMin,
    price_max: d.priceMax,
    summary: d.summary,
    description: d.description,
    suitable_for: d.suitableFor,
    icon: d.icon,
    featured: d.featured,
    sort_order: d.sortOrder,
  };

  const idRaw = String(formData.get("id") ?? "");

  // ---- YENİ İŞLEM ----
  if (idRaw === "") {
    // Adres (slug) sadece burada, eklerken oluşur; sonra değişmez
    const slug = slugify(d.name);
    if (!slug) return { error: "İşlem adı en az bir harf veya rakam içermeli.", values };

    const { error } = await supabase.from("services").insert({ ...cols, slug });
    if (error) {
      // 23505 = unique ihlali: aynı adresi kullanan bir işlem var (pasif olabilir)
      if (error.code === "23505") {
        return {
          error: `"/islemlerimiz/${slug}" adresini kullanan bir işlem zaten var (pasif olabilir). Adı biraz değiştirin.`,
          values,
        };
      }
      console.error(`[panel] işlem eklenemedi: ${error.code} ${error.message}`);
      return { error: "Kaydedilemedi. Lütfen tekrar deneyin.", values };
    }

    updateTag("services");
    redirect("/admin/islemler"); // yeni işlem listede görünsün
  }

  // ---- DÜZENLEME ----
  const id = z.coerce.number().int().positive().safeParse(idRaw);
  if (!id.success) return { error: "Geçersiz istek.", values };

  const { data, error } = await supabase.from("services").update(cols).eq("id", id.data).select("id");
  if (error) {
    console.error(`[panel] işlem güncellenemedi: ${error.code} ${error.message}`);
    return { error: "Kaydedilemedi. Lütfen tekrar deneyin.", values };
  }
  if (!data.length) return { error: "Bu işlem bulunamadı.", values };

  updateTag("services");
  refresh();
  return { saved: true };
}

export type ActiveState = { error?: string };

/** Pasife al / tekrar yayınla */
export async function setServiceActive(_prev: ActiveState, formData: FormData): Promise<ActiveState> {
  const { supabase, isDemoAccount } = await requireAdmin();
  if (isDemoAccount) return { error: DEMO_LOCKED_MESSAGE };

  const parsed = z
    .object({ id: z.coerce.number().int().positive(), active: z.enum(["true", "false"]) })
    .safeParse({ id: formData.get("id"), active: formData.get("active") });
  if (!parsed.success) return { error: "Geçersiz istek." };

  const { data, error } = await supabase
    .from("services")
    .update({ is_active: parsed.data.active === "true" })
    .eq("id", parsed.data.id)
    .select("id");

  if (error || !data.length) {
    console.error(`[panel] işlem durumu değişmedi: ${error?.code} ${error?.message}`);
    return { error: "Değiştirilemedi. Lütfen tekrar deneyin." };
  }

  updateTag("services");
  refresh();
  return {};
}
