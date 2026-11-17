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
import { beforeAfterItems, getCategory } from "@/data/beforeAfter";
import { serviceCategories } from "@/data/services";

const kategoriler = ["Tümü", ...serviceCategories];

export default function BeforeAfterGallery() {
  // Senin yazdığın kısım 👇
  // 1. Seçili kategoriyi HATIRLA (başlangıçta "Tümü")
  const [kategori, setKategori] = useState("Tümü");

  // 2. Listeyi ona göre FİLTRELE:
  //    "Tümü" seçiliyse ya da örneğin kategorisi seçilenle aynıysa → listede kalır
  const gorunenler = beforeAfterItems.filter(
    (item) => kategori === "Tümü" || getCategory(item) === kategori,
  );

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
          {gorunenler.map((item) => (
            <BeforeAfterCard key={item.id} item={item} />
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
