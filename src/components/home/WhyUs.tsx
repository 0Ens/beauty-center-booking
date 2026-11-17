import { HeartHandshake, ShieldCheck, Sparkles, UserRoundCheck } from "lucide-react";

const reasons = [
  {
    icon: UserRoundCheck,
    title: "Kişiye Özel Bakım",
    text: "Her bakımdan önce cildinizi inceliyor, size uygun uygulamayı birlikte seçiyoruz.",
  },
  {
    icon: ShieldCheck,
    title: "Hijyen Önceliğimiz",
    text: "Tek kullanımlık malzemeler ve steril ekipmanlarla güvenli bir ortam sunuyoruz.",
  },
  {
    icon: Sparkles,
    title: "Kaliteli Ürünler",
    text: "Cildinize yalnızca güvendiğimiz, kaliteli ürünleri uyguluyoruz.",
  },
  {
    icon: HeartHandshake,
    title: "Samimi Ortam",
    text: "Kendinizi rahat ve değerli hissedeceğiniz sıcak bir ortamda ağırlıyoruz.",
  },
];

export default function WhyUs() {
  return (
    <section className="container-page py-20">
      <div className="mb-12 text-center">
        <p className="eyebrow">Neden Biz?</p>
        <h2 className="heading-section mt-3">Size Kendinizi İyi Hissettirmek İçin</h2>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map(({ icon: Icon, title, text }) => (
          <div key={title} className="text-center">
            <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-blush-100 text-brand-700">
              <Icon size={26} strokeWidth={1.5} aria-hidden />
            </span>
            <h3 className="font-serif text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
