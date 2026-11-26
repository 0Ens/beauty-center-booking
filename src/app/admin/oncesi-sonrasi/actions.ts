"use server";
/*
 * ÖNCESİ / SONRASI: EKLE / DÜZENLE / SİL (Server Actions)
 *
 * Fotoğraflar tarayıcıda küçültülüp JPEG olarak geliyor (lib/photo.ts).
 * Ama tarayıcıdan gelen hiçbir şeye güvenmiyoruz: boyut, dosya türü ve
 * KVKK onayı burada (ve 0013 ile veritabanında) tekrar kontrol ediliyor.
 *
 * Kaydedince updateTag("before-after"): galeri, ana sayfa vitrini ve işlem
 * detay sayfaları yeni hali HEMEN görür.
 */
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { BEFORE_AFTER_BUCKET, beforeAfterPublicBase } from "@/lib/beforeAfterStorage";
import { DEMO_LOCKED_MESSAGE } from "@/lib/demoAdmin";
import { nowInIstanbul } from "@/lib/istanbulTime";
import { PHOTO_MAX_BYTES } from "@/lib/photo";
import { storagePathFromUrl } from "@/lib/storagePath";

export type BeforeAfterState = { error?: string; saved?: boolean };

const schema = z.object({
  serviceId: z.coerce.number("Bir işlem seçin.").int("Bir işlem seçin.").positive("Bir işlem seçin."),
  title: z.string().trim().min(2, "Başlık girin.").max(80, "Başlık en fazla 80 karakter olabilir."),
  description: z
    .string()
    .trim()
    .min(10, "Açıklama en az 10 karakter olmalı.")
    .max(500, "Açıklama en fazla 500 karakter olabilir."),
  takenOn: z.iso.date("Geçerli bir tarih girin."),
  featured: z.boolean(),
  sortOrder: z.coerce.number("Sıra bir sayı olmalı.").int("Sıra tam sayı olmalı.").min(0, "Sıra 0 veya daha büyük olmalı.").max(999, "Sıra en fazla 999 olabilir."),
});

function readFields(formData: FormData) {
  const s = (key: string) => String(formData.get(key) ?? "");
  return {
    serviceId: s("serviceId"),
    title: s("title"),
    description: s("description"),
    takenOn: s("takenOn"),
    featured: formData.get("featured") === "on",
    sortOrder: s("sortOrder"),
  };
}

/*
 * Gelen dosya gerçekten JPEG mi?
 * file.type tarayıcının SÖYLEDİĞİ tür; değiştirilebilir. Dosyanın ilk 3 baytına
 * bakıyoruz: her JPEG FF D8 FF ile başlar ("sihirli sayı" / magic bytes).
 */
async function checkPhoto(value: FormDataEntryValue | null, label: string): Promise<File | string> {
  if (!(value instanceof File) || value.size === 0) return `${label} fotoğrafını seçin.`;
  if (value.size > PHOTO_MAX_BYTES) return `${label} fotoğrafı çok büyük (en fazla 2 MB).`;
  const head = new Uint8Array(await value.slice(0, 3).arrayBuffer());
  if (head[0] !== 0xff || head[1] !== 0xd8 || head[2] !== 0xff) return `${label} fotoğrafı geçerli bir JPEG değil.`;
  return value;
}

/** Ekleme ve düzenleme aynı form; gizli "id" alanı boşsa yeni örnek */
export async function saveBeforeAfter(_prev: BeforeAfterState, formData: FormData): Promise<BeforeAfterState> {
  const { supabase, isDemoAccount } = await requireAdmin();
  if (isDemoAccount) return { error: DEMO_LOCKED_MESSAGE };

  const parsed = schema.safeParse(readFields(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  // Gelecek tarihli "sonuç" olamaz (iki tarih de "yıl-ay-gün" → yazı olarak karşılaştırılabilir)
  if (d.takenOn > nowInIstanbul().date) return { error: "Tarih bugünden sonra olamaz." };

  const cols = {
    service_id: d.serviceId,
    title: d.title,
    description: d.description,
    taken_on: d.takenOn,
    is_featured: d.featured,
    sort_order: d.sortOrder,
  };

  const idRaw = String(formData.get("id") ?? "");

  // ---- YENİ ÖRNEK ----
  if (idRaw === "") {
    if (formData.get("consent") !== "on") {
      return { error: "Müşterinin yazılı açık rızası alınmadan fotoğraf eklenemez (KVKK)." };
    }

    const before = await checkPhoto(formData.get("before"), "Öncesi");
    if (typeof before === "string") return { error: before };
    const after = await checkPhoto(formData.get("after"), "Sonrası");
    if (typeof after === "string") return { error: after };

    // 1) Fotoğrafları yükle. Ad: rastgele (uuid). Müşteri adı / tarih gibi bir
    //    bilgi dosya adında olmasın; tahmin edilemesin; iki dosya çakışmasın.
    const storage = supabase.storage.from(BEFORE_AFTER_BUCKET);
    const uploaded: string[] = [];
    for (const file of [before, after]) {
      const path = `${crypto.randomUUID()}.jpg`;
      const { error } = await storage.upload(path, file, {
        contentType: "image/jpeg",
        upsert: false,
        // Dosya adı hiç değişmiyor (yeni fotoğraf = yeni ad) → tarayıcı 1 yıl saklayabilir
        cacheControl: "31536000",
      });
      if (error) {
        console.error(`[panel] fotoğraf yüklenemedi: ${error.message}`);
        if (uploaded.length) await storage.remove(uploaded);
        return { error: "Fotoğraf yüklenemedi. Lütfen tekrar deneyin." };
      }
      uploaded.push(path);
    }
    const [beforeUrl, afterUrl] = uploaded.map((p) => storage.getPublicUrl(p).data.publicUrl);

    // 2) Satırı ekle. Olmazsa yüklenen fotoğrafları geri sil: sahipsiz
    //    (hiçbir örneğe bağlı olmayan) müşteri fotoğrafı Storage'da kalmasın.
    const { error } = await supabase
      .from("before_after")
      .insert({ ...cols, before_url: beforeUrl, after_url: afterUrl, consent_confirmed: true });
    if (error) {
      await storage.remove(uploaded);
      // 23503 = yabancı anahtar ihlali: seçilen işlem yok
      if (error.code === "23503") return { error: "Seçilen işlem bulunamadı." };
      console.error(`[panel] örnek eklenemedi: ${error.code} ${error.message}`);
      return { error: "Kaydedilemedi. Lütfen tekrar deneyin." };
    }

    updateTag("before-after");
    redirect("/admin/oncesi-sonrasi");
  }

  // ---- DÜZENLEME (fotoğraflar değişmez, bkz. 0013) ----
  const id = z.coerce.number().int().positive().safeParse(idRaw);
  if (!id.success) return { error: "Geçersiz istek." };

  const { data, error } = await supabase.from("before_after").update(cols).eq("id", id.data).select("id");
  if (error) {
    if (error.code === "23503") return { error: "Seçilen işlem bulunamadı." };
    console.error(`[panel] örnek güncellenemedi: ${error.code} ${error.message}`);
    return { error: "Kaydedilemedi. Lütfen tekrar deneyin." };
  }
  if (!data.length) return { error: "Bu örnek bulunamadı." };

  updateTag("before-after");
  refresh();
  return { saved: true };
}

export type DeleteState = { error?: string };

/** Örneği VE fotoğraflarını tamamen siler (müşteri rızasını geri çekerse de bu kullanılır) */
export async function deleteBeforeAfter(_prev: DeleteState, formData: FormData): Promise<DeleteState> {
  const { supabase, isDemoAccount } = await requireAdmin();
  if (isDemoAccount) return { error: DEMO_LOCKED_MESSAGE };

  const id = z.coerce.number().int().positive().safeParse(formData.get("id"));
  if (!id.success) return { error: "Geçersiz istek." };

  // 1) Önce satır: silinince sitede artık hiçbir yer bu fotoğrafları göstermez.
  //    .select → silinen satırın fotoğraf adreslerini geri ver (dosyaları silmek için)
  const { data, error } = await supabase
    .from("before_after")
    .delete()
    .eq("id", id.data)
    .select("before_url, after_url");
  if (error || !data.length) {
    console.error(`[panel] örnek silinemedi: ${error?.code} ${error?.message}`);
    return { error: "Silinemedi. Lütfen tekrar deneyin." };
  }

  // 2) Sonra dosyalar. Örnek çizimler (/ornek/...) Storage'da değil → null → atlanır.
  const paths = [data[0].before_url, data[0].after_url]
    .map((url) => storagePathFromUrl(url, beforeAfterPublicBase))
    .filter((p): p is string => p !== null);
  if (paths.length) {
    const { error: removeError } = await supabase.storage.from(BEFORE_AFTER_BUCKET).remove(paths);
    if (removeError) {
      // Örnek siteden kalktı ama dosya Storage'da kaldı → elle silinmeli (KVKK)
      console.error(`[panel] DİKKAT: fotoğraf dosyaları silinemedi, Storage'dan elle silin: ${paths.join(", ")}`);
    }
  }

  updateTag("before-after");
  redirect("/admin/oncesi-sonrasi");
}
