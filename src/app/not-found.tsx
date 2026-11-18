import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import NotFoundContent from "@/components/NotFoundContent";

/*
 * KÖK 404 SAYFASI
 *
 * İki durumda açılır:
 *  1. Hiçbir sayfayla eşleşmeyen adres (ör. /fiyatlar-2023)
 *  2. Kendi not-found.tsx'i olmayan bir sayfada notFound() çağrılırsa
 *
 * Bu dosya KÖK layout'un içinde çalışır; menü ve footer ise (site)/layout.tsx'te.
 * O yüzden onları burada kendimiz ekliyoruz ki ziyaretçi siteden kopmasın.
 *
 * Next.js 404 sayfalarına otomatik <meta name="robots" content="noindex"> ekler:
 * Google bu sayfayı dizine almaz.
 */
export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <NotFoundContent />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
