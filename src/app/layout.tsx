import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Luxurious_Script } from "next/font/google";
import { site } from "@/lib/site";
import { siteUrl } from "@/lib/siteUrl";
import "./globals.css";

// ==================== MARKA AYARLARI: FONTLAR ====================
// Başlık (serif), metin (sans) ve logo (el yazısı) fontları. Başka bir Google
// fontuna geçmek için import'u ve aşağıdaki tanımı değiştirmek yeterli;
// CSS değişken adları (--font-...) aynı kalırsa sitenin geri kalanı etkilenmez.
//
// next/font fontları build sırasında indirip siteyle birlikte sunar:
// Google'a ayrı istek gitmez (hız + gizlilik) ve sayfa yüklenirken yazılar zıplamaz.
// "latin-ext" alt kümesi Türkçe karakterler (ş, ğ, ı, İ) için ŞART.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Logodaki el yazısı font: Luxurious Script.
// El yazısı (script) fontlar SADECE logo ve kısa vurgularda kullanılır:
// uzun metinde okunması zordur. Tek ağırlığı (400) var; "font-bold" verilirse
// tarayıcı sahte kalınlık üretir ve çirkin görünür.
const luxurious = Luxurious_Script({
  variable: "--font-luxurious",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  // Göreli adresleri (ör. paylaşım görseli "/opengraph-image") tam adrese çevirmek için taban.
  metadataBase: new URL(siteUrl),
  // Alt sayfalar sadece kendi başlığını verir, şablon sonuna salon adını ekler:
  // "İşlemlerimiz | Demo Güzellik Merkezi"
  title: {
    default: `${site.name} | Cilt Bakımı ve Güzellik`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  // Open Graph: link WhatsApp/Instagram/Facebook'ta paylaşılınca çıkan önizleme kartı.
  // Görseli ayrıca vermiyoruz: app/opengraph-image.tsx dosyası onu otomatik ekliyor.
  openGraph: {
    siteName: site.name,
    locale: "tr_TR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

// Kök layout TÜM sayfaları sarar (ziyaretçi sayfaları + panel): sadece
// <html>, <body> ve fontlar. Menü/footer (site)/layout.tsx'te, panelin
// kendi düzeni admin/layout.tsx'te.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // lang="tr" önemli: CSS'teki "uppercase" i harfini doğru şekilde "İ" yapar,
    // ekran okuyucular da metni Türkçe okur.
    <html lang="tr" className={`${cormorant.variable} ${jost.variable} ${luxurious.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
