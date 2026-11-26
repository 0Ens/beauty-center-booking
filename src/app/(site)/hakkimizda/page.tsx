import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CtaBand from "@/components/CtaBand";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hakkımızda",
  // Ek almayan cümle: "…Merkezi'ni" / "…Studio'yu" gibi ekler salon adına göre değişir
  description: `${site.name}: hikayemiz ve bakım anlayışımız.`,
};

/*
 * Metinler src/lib/site.ts → about alanından geliyor.
 * Solda salon ya da salon sahibinin fotoğrafı yoksa dekoratif bir kutu görünür.
 */
export default function AboutPage() {
  return (
    <>
      <PageHeader title="Hakkımızda" description="Bakım anlayışımız ve hikayemiz." />

      <section className="container-page grid items-center gap-12 py-12 md:grid-cols-2">
        <div
          aria-hidden
          className="mx-auto aspect-square w-full max-w-md rounded-[3rem] bg-linear-to-br from-blush-100 via-blush-200 to-blush-300"
        />

        <div>
          <p className="eyebrow">{site.about.greeting}</p>
          <h2 className="heading-section mt-3">{site.about.heading}</h2>
          <div className="mt-6 space-y-4 leading-relaxed text-ink-soft">
            {site.about.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-12">
        <CtaBand />
      </div>
    </>
  );
}
