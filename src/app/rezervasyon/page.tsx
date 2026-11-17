import type { Metadata } from "next";
import { CalendarCheck, Clock, ListChecks, UserRound } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Online Randevu",
  description: "İşleminizi, gününüzü ve saatinizi seçerek online randevu oluşturun.",
};

const steps = [
  { icon: ListChecks, label: "İşlem seçin" },
  { icon: CalendarCheck, label: "Gün seçin" },
  { icon: Clock, label: "Saat seçin" },
  { icon: UserRound, label: "Bilgilerinizi girin" },
];

/*
 * GEÇİCİ: Adım adım rezervasyon formu Aşama 4'te gelecek.
 * Şimdilik adımları gösteriyor ve telefon / WhatsApp seçeneği sunuyoruz.
 */
export default function BookingPage() {
  const wa = whatsappLink();

  return (
    <>
      <PageHeader
        title="Online Randevu"
        description="Birkaç adımda size uygun gün ve saate randevunuzu oluşturun."
      />

      <section className="container-page py-12">
        <ol className="mx-auto grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {steps.map(({ icon: Icon, label }, i) => (
            <li key={label} className="flex flex-col items-center text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-white text-brand-700 shadow">
                <Icon size={24} strokeWidth={1.5} aria-hidden />
              </span>
              <span className="mt-3 text-xs text-ink-soft">Adım {i + 1}</span>
              <span className="text-sm font-medium">{label}</span>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-12 max-w-2xl rounded-3xl border-2 border-dashed border-blush-300 bg-white p-10 text-center">
          <p className="font-serif text-2xl font-semibold">Online randevu sistemi çok yakında</p>
          <p className="mt-3 text-sm text-ink-soft">
            Şimdilik randevu için bizimle telefon ya da WhatsApp üzerinden iletişime geçebilirsiniz.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {site.phone && (
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="btn-secondary">
                {site.phone}
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary">
                WhatsApp ile Yazın
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
