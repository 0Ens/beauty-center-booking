import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Pinyon_Script } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { site } from "@/lib/site";
import "./globals.css";

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

// Markanın logosundaki yazıya en yakın Google fontu.
// El yazısı (script) fontlar SADECE logo ve kısa vurgularda kullanılır:
// uzun metinde okunması zordur. Tek ağırlığı (400) var; "font-bold" verilirse
// tarayıcı sahte kalınlık üretir ve çirkin görünür.
const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  // Alt sayfalar sadece kendi başlığını verir, şablon sonuna salon adını ekler:
  // "İşlemlerimiz | Demo Güzellik Merkezi"
  title: {
    default: `${site.name} | Cilt Bakımı ve Güzellik`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

// layout.tsx tüm sayfaları sarar: Header ve Footer burada bir kez yazılır,
// {children} yerine o an açık olan sayfa gelir.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // lang="tr" önemli: CSS'teki "uppercase" i harfini doğru şekilde "İ" yapar,
    // ekran okuyucular da metni Türkçe okur.
    <html lang="tr" className={`${cormorant.variable} ${jost.variable} ${pinyon.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
