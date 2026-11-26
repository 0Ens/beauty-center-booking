import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarHeart, Check, Clock } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { getServiceBySlug, getServices } from "@/data/services";

/*
 * DİNAMİK ROUTE: Klasör adındaki [slug] bir değişkendir.
 * /islemlerimiz/kirpik-lifting adresine gidilince slug = "kirpik-lifting" olur.
 * Böylece her işlem için ayrı dosya yazmak yerine tek bir şablon kullanıyoruz.
 */

// Build sırasında hangi slug'lar için sayfa üretileceğini söylüyoruz (statik üretim → çok hızlı).
// Listede olmayan yeni bir işlem (salon sahibi panelden ekleyince) ilk ziyarette üretilir.
export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({ slug: service.slug }));
}

// Next.js 16'da params bir Promise; değerine ulaşmak için "await" gerekiyor.
export async function generateMetadata({ params }: PageProps<"/islemlerimiz/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  // İşlem yoksa sayfa not-found.tsx'i gösterecek; sekme başlığı da ona uysun.
  if (!service) return { title: "İşlem bulunamadı" };
  return { title: service.name, description: service.summary };
}

/*
 * SUSPENSE NEDEN VAR?
 * `await params` URL'ye bağlı bir veri: hangi işlemin açılacağı ancak adres
 * bilinince belli olur. Bu bekleme sayfanın EN ÜSTÜNDE olsaydı, Next.js
 * sayfaya geçişte hiçbir şey gösteremez, her şeyin hazır olmasını beklerdi.
 *
 * Çözüm: Sayfanın kendisi hiçbir şey beklemiyor (anında gösterilebilir "kabuk"),
 * URL'ye bağlı kısım ise <Suspense> içinde. O kısım hazır olana kadar
 * `fallback` (iskelet görünüm) gösterilir. Veri artık Supabase'den geldiği
 * için bu yapı daha da önemli (veritabanı isteği zaman alır).
 */
export default function ServiceDetailPage({ params }: PageProps<"/islemlerimiz/[slug]">) {
  return (
    <Suspense fallback={<ServiceDetailSkeleton />}>
      <ServiceDetail params={params} />
    </Suspense>
  );
}

async function ServiceDetail({ params }: Pick<PageProps<"/islemlerimiz/[slug]">, "params">) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  // Böyle bir işlem yoksa 404 sayfası göster
  if (!service) notFound();

  return (
    <>
      <PageHeader title={service.name} description={service.summary} />

      <section className="container-page grid gap-10 py-12 lg:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="heading-section mb-4">İşlem Hakkında</h2>
          <p className="leading-relaxed text-ink-soft">{service.description}</p>

          <h2 className="heading-section mt-12 mb-4">Kimler İçin Uygun?</h2>
          <ul className="space-y-3">
            {service.suitableFor.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blush-100 text-brand-700">
                  <Check size={14} aria-hidden />
                </span>
                <span className="text-ink-soft">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-3xl border border-blush-200 bg-white p-8 shadow-[0_10px_40px_-20px_rgba(163,83,106,0.35)] lg:sticky lg:top-40">
          <p className="eyebrow">{service.category}</p>
          <p className="mt-4 flex items-center gap-2 text-ink-soft">
            <Clock size={18} className="text-brand-600" aria-hidden /> Yaklaşık {service.durationMin} dakika
          </p>
          <Link href={`/rezervasyon?islem=${service.slug}`} className="btn-primary mt-6 w-full">
            <CalendarHeart size={18} aria-hidden /> Bu İşlem İçin Randevu Al
          </Link>
          <Link href="/islemlerimiz" className="mt-4 block text-center text-sm text-ink-soft hover:text-brand-700">
            ← Tüm işlemlere dön
          </Link>
        </aside>
      </section>
    </>
  );
}

/** Yüklenirken görünen iskelet: gerçek sayfayla aynı yerleşim, gri kutular (animate-pulse = hafif yanıp sönme) */
function ServiceDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Yükleniyor" className="animate-pulse">
      <section className="bg-linear-to-b from-blush-200 to-blush-50 py-14 sm:py-20">
        <div className="container-page flex flex-col items-center gap-4">
          <div className="h-3 w-40 rounded-full bg-blush-200" />
          <div className="h-10 w-72 max-w-full rounded-full bg-blush-200" />
          <div className="h-4 w-96 max-w-full rounded-full bg-blush-200" />
        </div>
      </section>
      <section className="container-page grid gap-10 py-12 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="h-8 w-56 rounded-full bg-blush-200" />
          <div className="h-4 w-full rounded-full bg-blush-100" />
          <div className="h-4 w-5/6 rounded-full bg-blush-100" />
        </div>
        <div className="h-48 rounded-3xl bg-blush-100" />
      </section>
    </div>
  );
}
