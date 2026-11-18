import Link from "next/link";

/*
 * PANEL 404
 *
 * Panel sayfalarındaki notFound() (ör. silinmiş bir işlemin düzenleme linki)
 * buraya düşer; panelin kendi düzeni içinde kalır, sitenin menüsü görünmez.
 */
export default function AdminNotFound() {
  return (
    <div className="py-12 text-center">
      <h1 className="font-serif text-2xl font-semibold text-ink">Kayıt bulunamadı</h1>
      <p className="mt-3 text-ink-soft">Bu kayıt silinmiş ya da link hatalı olabilir.</p>
      <Link href="/admin" className="btn-primary mt-8">
        Panele Dön
      </Link>
    </div>
  );
}
