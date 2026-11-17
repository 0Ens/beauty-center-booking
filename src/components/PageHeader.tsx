import Link from "next/link";
import { ChevronRight } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: string;
};

/** Ana sayfa dışındaki her sayfanın üstündeki başlık bandı (başlık + "Ana Sayfa › ..." yolu) */
export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <section className="bg-linear-to-b from-blush-200 to-blush-50 py-14 text-center sm:py-20">
      <div className="container-page">
        <nav aria-label="Sayfa yolu" className="mb-4 flex items-center justify-center gap-1 text-xs text-ink-soft">
          <Link href="/" className="hover:text-brand-700">
            Ana Sayfa
          </Link>
          <ChevronRight size={14} aria-hidden />
          <span aria-current="page">{title}</span>
        </nav>
        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">{title}</h1>
        {description && <p className="mx-auto mt-4 max-w-2xl text-ink-soft">{description}</p>}
      </div>
    </section>
  );
}
