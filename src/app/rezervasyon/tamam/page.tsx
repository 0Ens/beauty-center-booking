import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { getServiceBySlug } from "@/data/services";
import { formatDayLong } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Randevu Talebiniz Alındı",
  robots: { index: false }, // arama motorlarında çıkmasına gerek yok
};

/*
 * ONAY SAYFASI: Server Action başarılı olunca buraya yönlendiriyor.
 * URL'de sadece işlem, gün ve saat var; ad ve telefon YOK (kişisel veri
 * URL'ye yazılırsa tarayıcı geçmişinde ve sunucu kayıtlarında kalır).
 */
export default function BookingDonePage({ searchParams }: PageProps<"/rezervasyon/tamam">) {
  return (
    <>
      <PageHeader title="Randevu Talebiniz Alındı" />
      <section className="container-page py-12">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-blush-100 text-brand-700">
            <CalendarCheck size={30} strokeWidth={1.5} aria-hidden />
          </span>
          <Suspense fallback={<div className="mx-auto mt-6 h-24 max-w-sm animate-pulse rounded-2xl bg-blush-50" />}>
            <Summary searchParams={searchParams} />
          </Suspense>
          <p className="mt-6 text-sm text-ink-soft">
            Talebiniz salonumuza ulaştı. Uygunluğu kontrol ettikten sonra randevunuzu onaylamak için
            sizinle iletişime geçeceğiz. Değişiklik ya da iptal için bizi arayabilirsiniz
            {site.phone && (
              <>
                :{" "}
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="font-medium text-brand-700 underline">
                  {site.phone}
                </a>
              </>
            )}
            .
          </p>
          <Link href="/" className="btn-secondary mt-8">
            Ana Sayfaya Dön
          </Link>
        </div>
      </section>
    </>
  );
}

async function Summary({ searchParams }: { searchParams: PageProps<"/rezervasyon/tamam">["searchParams"] }) {
  const params = await searchParams;
  const service = typeof params.islem === "string" ? await getServiceBySlug(params.islem) : undefined;
  // Elle değiştirilmiş bir URL'de saçma bir tarih/saat göstermeyelim
  const date = typeof params.tarih === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.tarih) ? params.tarih : undefined;
  const time = typeof params.saat === "string" && /^\d{2}:\d{2}$/.test(params.saat) ? params.saat : undefined;

  if (!service || !date || !time) return null;

  return (
    <dl className="mt-6 space-y-1">
      <dt className="sr-only">İşlem</dt>
      <dd className="font-serif text-2xl font-semibold">{service.name}</dd>
      <dt className="sr-only">Tarih ve saat</dt>
      <dd className="text-ink-soft">
        {formatDayLong(date)}, saat {time}
      </dd>
    </dl>
  );
}
