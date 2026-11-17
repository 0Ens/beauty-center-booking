import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

/*
 * ZİYARETÇİ SAYFALARININ DÜZENİ
 *
 * (site) bir "route group": parantezli klasör adı ADRESE EKLENMEZ.
 * src/app/(site)/rezervasyon → yine /rezervasyon.
 * Tek amacı bu sayfalara ortak bir layout vermek: menü, footer, WhatsApp.
 * Yönetim paneli (/admin) bu grubun dışında, onları göstermez.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
