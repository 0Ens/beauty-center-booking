/*
 * İŞLEM İKONLARI
 * Veritabanında ikon sadece bir metin ("droplets"); React bileşenini veritabanına
 * kaydedemeyiz. Bu dosya metni ikon bileşenine çevirir.
 *
 * Ayrı dosyada çünkü hem sunucu bileşenleri (ServiceCard) hem panel formu
 * (tarayıcıda çalışan client bileşen) kullanıyor. data/services.ts'den import
 * etselerdi Supabase istemcisi de tarayıcı paketine girerdi.
 */
import { Droplets, Eye, Flower2, Leaf, Sparkles, Sun, type LucideIcon } from "lucide-react";

export const iconNames = ["droplets", "sparkles", "leaf", "sun", "flower", "eye"] as const;
export type ServiceIconName = (typeof iconNames)[number];

export const serviceIcons: Record<ServiceIconName, LucideIcon> = {
  droplets: Droplets,
  sparkles: Sparkles,
  leaf: Leaf,
  sun: Sun,
  flower: Flower2,
  eye: Eye,
};

/** Panelde ikon seçerken ekran okuyucunun söyleyeceği adlar */
export const iconLabels: Record<ServiceIconName, string> = {
  droplets: "Damla",
  sparkles: "Parıltı",
  leaf: "Yaprak",
  sun: "Güneş",
  flower: "Çiçek",
  eye: "Göz",
};

// Veritabanında tanımadığımız bir değer olursa site çökmesin diye kontrol
export function isIconName(value: string): value is ServiceIconName {
  return (iconNames as readonly string[]).includes(value);
}
