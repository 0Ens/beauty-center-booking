import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Demo Güzellik Merkezi'ni ve bakım anlayışımızı tanıyın.",
};

/*
 * TODO: Bu metinler geçici. Salon sahibinin kendi hikayesi, deneyimi, aldığı
 * eğitimler/sertifikalar ve salon fotoğraflarıyla değiştirilecek.
 */
export default function AboutPage() {
  return (
    <>
      <PageHeader title="Hakkımızda" description="Bakım anlayışımız ve hikayemiz." />

      <section className="container-page grid items-center gap-12 py-12 md:grid-cols-2">
        {/* TODO: Salon sahibinin ya da salonun fotoğrafı */}
        <div
          aria-hidden
          className="mx-auto aspect-square w-full max-w-md rounded-[3rem] bg-linear-to-br from-blush-100 via-blush-200 to-blush-300"
        />

        <div>
          <p className="eyebrow">Merhaba, hoş geldiniz</p>
          <h2 className="heading-section mt-3">Güzellik, iyi hissetmekle başlar</h2>
          <div className="mt-6 space-y-4 leading-relaxed text-ink-soft">
            <p>
              [Buraya salon sahibinin kendi anlatımıyla hikayesi gelecek: bu mesleğe nasıl başladığı, neden
              sevdiği, kaç yıldır bu işi yaptığı.]
            </p>
            <p>
              Salonumuzda her müşterimizi dinliyor, cildini tanıyor ve ona en uygun bakımı birlikte
              planlıyoruz. Amacımız sadece güzel görünmeniz değil, kendinizi iyi ve değerli
              hissetmeniz.
            </p>
            <p>[Aldığı eğitimler ve sertifikalar]</p>
          </div>
        </div>
      </section>

      <div className="mt-12">
        <CtaBand />
      </div>
    </>
  );
}
