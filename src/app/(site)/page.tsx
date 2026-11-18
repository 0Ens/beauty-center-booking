import Hero from "@/components/home/Hero";
import FeaturedServices from "@/components/home/FeaturedServices";
import BeforeAfterTeaser from "@/components/home/BeforeAfterTeaser";
import WhyUs from "@/components/home/WhyUs";
import CtaBand from "@/components/CtaBand";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";

// Ana sayfa küçük bölüm bileşenlerinden oluşuyor. Her bölüm kendi dosyasında,
// böylece bir bölümü değiştirmek ya da sırasını oynatmak çok kolay.
export default function HomePage() {
  return (
    <>
      {/* Google için işletme bilgisi (ekranda görünmez) */}
      <LocalBusinessJsonLd />
      <Hero />
      <FeaturedServices />
      <BeforeAfterTeaser />
      <WhyUs />
      <CtaBand />
    </>
  );
}
