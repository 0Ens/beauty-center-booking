"use client";
/*
 * ÖNCESİ / SONRASI KAYDIRICISI
 *
 * Nasıl çalışıyor?
 *  1. İki görsel ÜST ÜSTE duruyor: altta "sonrası", üstte "öncesi".
 *  2. Üstteki görsel clip-path ile sağdan kırpılıyor → sadece sol tarafı görünüyor.
 *     yuzde = 30 ise öncesinin soldaki %30'u görünür, kalan %70'te alttaki
 *     "sonrası" görünür. Çizgi tam bu sınırda duruyor.
 *  3. Fare/parmak hareket ettikçe hesaplaYuzde() (src/lib/slider.ts) yeni konumu
 *     buluyor, state güncelleniyor, React kırpmayı ve çizgiyi yeniden çiziyor.
 */
import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { hesaplaYuzde } from "@/lib/slider";

type Props = {
  before: string;
  after: string;
  /** Görseli anlatan kısa metin, ör. "Akne bakımı" (ekran okuyucular için) */
  alt: string;
  /** Tarayıcıya görselin ekranda ne kadar yer kaplayacağını söyler → doğru boyutta indirir */
  sizes?: string;
  /** Sayfanın en üstündeki ilk kart → görseller beklemeden, öncelikli insin (LCP) */
  eager?: boolean;
};

export default function BeforeAfterSlider({
  before,
  after,
  alt,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  eager = false,
}: Props) {
  // İki görsel de ekranda görünüyor; ikisi de aynı öncelikle yüklenmeli
  const yukleme = eager ? ({ loading: "eager", fetchPriority: "high" } as const) : {};
  const [yuzde, setYuzde] = useState(50); // çizgi başlangıçta ortada
  const kutuRef = useRef<HTMLDivElement>(null);

  function konumuGuncelle(clientX: number) {
    const kutu = kutuRef.current;
    if (!kutu) return;
    // getBoundingClientRect(): kutunun ekrandaki yeri (left, width...) = hesaplaYuzde'nin beklediği "rect"
    setYuzde(hesaplaYuzde(clientX, kutu.getBoundingClientRect()));
  }

  /*
   * POINTER EVENTS: fare, dokunmatik ekran ve kalemi TEK kodla yönetir.
   * (Eskiden mouse ve touch olayları için ayrı ayrı kod yazmak gerekirdi.)
   *
   * setPointerCapture: "Bu parmak/fare bırakılana kadar tüm hareketleri BANA
   * gönder." Böylece fare kutunun dışına çıksa bile sürükleme devam eder;
   * hesaplaYuzde'deki 0–100 sınırlaması da tam bu durumda işe yarıyor.
   */
  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    konumuGuncelle(e.clientX); // tıklanan yere hemen atla
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    // Fare basılı değilken de "move" gelir (üzerinde gezinirken).
    // Sadece yakalama (capture) aktifse, yani basılı tutarken sürükle.
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    konumuGuncelle(e.clientX);
  }

  /*
   * KLAVYE ERİŞİLEBİLİRLİĞİ
   * Fare kullanamayan (ya da Tab tuşuyla gezen) biri de kaydırıcıyı
   * kullanabilmeli. Tutamak odaklanınca ok tuşlarıyla hareket eder.
   */
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const adim = e.shiftKey ? 10 : 2;
    let yeni: number;
    if (e.key === "ArrowLeft") yeni = yuzde - adim;
    else if (e.key === "ArrowRight") yeni = yuzde + adim;
    else if (e.key === "Home") yeni = 0;
    else if (e.key === "End") yeni = 100;
    else return; // başka tuşlara dokunma (Tab çalışmaya devam etsin)

    e.preventDefault(); // ok tuşları sayfayı kaydırmasın
    setYuzde(Math.min(100, Math.max(0, yeni))); // 0–100 arasına sınırla
  }

  const yuvarlak = Math.round(yuzde);

  return (
    <div
      ref={kutuRef}
      /*
       * touch-pan-y: Mobilde parmak YUKARI-AŞAĞI kayarsa tarayıcı sayfayı
       * kaydırsın, SAĞA-SOLA kayarsa olay bize gelsin. Bunu yazmasak
       * kaydırıcının üstünden sayfayı aşağı kaydırmak imkânsız olurdu.
       * select-none: sürüklerken yazılar/görseller mavi seçime dönmesin.
       */
      className="relative aspect-4/5 cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-3xl bg-blush-100"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {/* Alt katman: SONRASI (her zaman tamamı görünür, üstü örtülür) */}
      <Image src={after} alt={`${alt} — sonrası`} fill sizes={sizes} draggable={false} className="object-cover" {...yukleme} />

      {/* Üst katman: ÖNCESİ, sağdan kırpılmış.
          inset(üst sağ alt sol): sağdan (100 - yuzde)% kes → soldaki yuzde% kalır */}
      <Image
        src={before}
        alt={`${alt} — öncesi`}
        fill
        sizes={sizes}
        draggable={false}
        className="object-cover"
        {...yukleme}
        style={{ clipPath: `inset(0 ${100 - yuzde}% 0 0)` }}
      />

      {/* Etiketler */}
      <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-white/85 px-3 py-1 text-xs font-medium tracking-wide text-ink">
        Öncesi
      </span>
      <span className="pointer-events-none absolute top-4 right-4 rounded-full bg-white/85 px-3 py-1 text-xs font-medium tracking-wide text-ink">
        Sonrası
      </span>

      {/* Çizgi + tutamak: left = yuzde%. -translate-x-1/2 → çizginin ORTASI tam sınırda */}
      <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow" style={{ left: `${yuzde}%` }}>
        <div
          role="slider"
          tabIndex={0}
          aria-label={`${alt}: öncesi ve sonrası karşılaştırma`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={yuvarlak}
          aria-valuetext={`%${yuvarlak} öncesi, %${100 - yuvarlak} sonrası`}
          onKeyDown={handleKeyDown}
          className="pointer-events-auto absolute top-1/2 left-1/2 flex size-11 -translate-1/2 items-center justify-center rounded-full border-2 border-white bg-brand-700/90 text-white shadow-lg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
        >
          <ChevronLeft size={16} strokeWidth={2.5} className="-mr-1" />
          <ChevronRight size={16} strokeWidth={2.5} className="-ml-1" />
        </div>
      </div>
    </div>
  );
}
