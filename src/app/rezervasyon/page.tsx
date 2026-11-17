import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import { site, whatsappLink } from "@/lib/site";
import BookingSteps from "./BookingSteps";

export const metadata: Metadata = {
  title: "Online Randevu",
  description: "İşleminizi, gününüzü ve saatinizi seçerek online randevu oluşturun.",
};

/*
 * Sayfanın kendisi hiçbir şey beklemiyor (anında gösterilen kabuk).
 * URL'ye (searchParams) ve veritabanına bağlı adımlar <Suspense> içinde;
 * hazır olana kadar iskelet görünüm gösterilir.
 */
export default function BookingPage({ searchParams }: PageProps<"/rezervasyon">) {
  const wa = whatsappLink();

  return (
    <>
      <PageHeader
        title="Online Randevu"
        description="Birkaç adımda size uygun gün ve saate randevunuzu oluşturun."
      />

      <section className="container-page py-12">
        <Suspense fallback={<StepsSkeleton />}>
          <BookingSteps searchParams={searchParams} />
        </Suspense>

        <p className="mx-auto mt-16 max-w-3xl text-center text-sm text-ink-soft">
          Online randevu yerine konuşarak ayarlamak isterseniz{" "}
          {site.phone && (
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="font-medium text-brand-700 underline">
              {site.phone}
            </a>
          )}
          {wa && (
            <>
              {" "}
              ya da{" "}
              <a href={wa} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline">
                WhatsApp
              </a>
            </>
          )}{" "}
          üzerinden bize ulaşabilirsiniz.
        </p>
      </section>
    </>
  );
}

function StepsSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse" aria-hidden>
      <div className="mb-4 h-8 w-48 rounded-full bg-blush-200" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-14 rounded-2xl bg-white" />
        ))}
      </div>
    </div>
  );
}
