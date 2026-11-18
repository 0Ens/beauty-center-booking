"use client";
/*
 * KATEGORİ FİLTRELİ ÖNCESİ / SONRASI GALERİSİ
 *
 * Neden ayrı bir bileşen?
 * Sayfa (page.tsx) "metadata" dışa aktardığı için SUNUCU bileşeni kalmak
 * zorunda; sunucu bileşeninde useState kullanılamaz. Hatırlanması gereken
 * şey (seçili kategori) olduğu için o kısmı buraya, "use client" bir
 * bileşene taşıdık. Sayfa sadece bu bileşeni çağırıyor.
 */
import { useState } from "react";
import BeforeAfterCard from "./BeforeAfterCard";
import type { BeforeAfterEntry } from "@/data/beforeAfter";

type Props = {
  items: BeforeAfterEntry[]; // sunucudan hazır gelir (kategorisi hesaplanmış)
  categories: string[];
};

export default function BeforeAfterGallery({ items, categories }: Props) {
  const kategoriler = ["Tümü", ...categories];

  // Senin yazdığın kısım 👇
  // 1. Seçili kategoriyi HATIRLA (başlangıçta "Tümü")
  const [kategori, setKategori] = useState("Tümü");

  // 2. Listeyi ona göre FİLTRELE:
  //    "Tümü" seçiliyse ya da örneğin kategorisi seçilenle aynıysa → listede kalır
  const gorunenler = items.filter((item) => kategori === "Tümü" || item.category === kategori);

  return (
    <>
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {kategoriler.map((k) => {
          const secili = k === kategori;
          return (
            <button
              key={k}
              type="button"
              // Tıklanınca state değişir → React bileşeni yeniden çalıştırır →
              // filtre yeni kategoriyle tekrar hesaplanır → ekran güncellenir.
              onClick={() => setKategori(k)}
              // aria-pressed: ekran okuyucuya "bu düğme şu an basılı/seçili" der
              aria-pressed={secili}
              className={`cursor-pointer rounded-full px-5 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 ${
                secili
                  ? "bg-brand-700 text-white"
                  : "border border-blush-300 bg-white text-ink hover:border-brand-600 hover:text-brand-700"
              }`}
            >
              {k}
            </button>
          );
        })}
      </div>

      {gorunenler.length > 0 ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {gorunenler.map((item, i) => (
            // Sayfada h1'den sonra başka başlık yok → kart başlıkları h2.
            // İlk kart ekranın en üstünde (LCP) → görselleri öncelikli.
            <BeforeAfterCard key={item.id} item={item} headingLevel="h2" eager={i === 0} />
          ))}
        </div>
      ) : (
        // Aşama 3'te veriler panelden gelecek; bir kategoride henüz örnek
        // yoksa boş ekran yerine açıklama gösterelim.
        <p className="py-16 text-center text-ink-soft">Bu kategoride henüz örnek yok.</p>
      )}
    </>
  );
}
