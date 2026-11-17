/*
 * Öncesi/sonrası fotoğraflarının durduğu Storage kovası (0013).
 * Kova "public": dosyalar aşağıdaki adres + dosya adı ile herkese açık.
 */
import { supabaseUrl } from "./supabaseEnv";

export const BEFORE_AFTER_BUCKET = "before-after";

/** Sonu "/" ile biter: base + "3f2a.jpg" = fotoğrafın tam adresi */
export const beforeAfterPublicBase = `${supabaseUrl}/storage/v1/object/public/${BEFORE_AFTER_BUCKET}/`;
