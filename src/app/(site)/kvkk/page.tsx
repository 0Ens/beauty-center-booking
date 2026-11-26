import type { Metadata } from "next";
import type { ReactNode } from "react";
import PageHeader from "@/components/PageHeader";
import { site } from "@/lib/site";
import { isDemo } from "@/lib/siteMode";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: `${site.name} randevu sisteminde kişisel verilerinizin nasıl işlendiğine dair aydınlatma metni.`,
};

/*
 * KVKK AYDINLATMA METNİ (6698 sayılı Kanun md. 10 + Aydınlatma Yükümlülüğü Tebliği)
 *
 * Aydınlatma ≠ açık rıza. Burada müşteriden izin İSTEMİYORUZ; verisini neden ve
 * nasıl işlediğimizi ANLATIYORUZ. Randevu verisi zaten "sözleşmenin kurulması/ifası"
 * gerekçesiyle (md. 5/2-c) işlenebiliyor; ayrıca rıza istemek Kurul'un eleştirdiği bir hata.
 *
 * Tebliğ'e göre metinde olması gerekenler: veri sorumlusunun kimliği, işleme amacı,
 * kimlere ve hangi amaçla aktarıldığı, toplama yöntemi ve hukuki sebebi, md. 11 hakları.
 *
 * ŞABLON NOTU: Bu metin bir başlangıç taslağıdır, hukuki görüş değildir.
 * Gerçek bir salonda kullanmadan önce (bkz. docs/YENI-MUSTERI.md):
 *   - site.legalName vergi levhasına göre yazılmalı
 *   - Yurt dışındaki sunuculara (veritabanı, barındırma) aktarım için KVKK md. 9
 *     dayanağı netleştirilip "Aktarım" bölümüne eklenmeli
 *   - Metin bir hukukçuya okutulmalı, LAST_UPDATED güncellenmeli
 *
 * Demo modunda sayfanın başına "bu sitede kişisel veri toplanmaz" notu eklenir.
 */
const LAST_UPDATED = "18 Kasım 2026";

export default function KvkkPage() {
  return (
    <>
      <PageHeader
        title="KVKK Aydınlatma Metni"
        description="Randevu alırken paylaştığınız bilgileri neden ve nasıl kullandığımız."
      />

      <article className="container-page max-w-3xl space-y-8 py-12 leading-relaxed text-ink-soft">
        {isDemo && (
          <p role="note" className="rounded-2xl border border-brand-400 bg-blush-100 px-5 py-4 text-sm text-ink">
            <strong>Demo site:</strong> {site.name} hayali bir işletmedir ve bu sitede kişisel veri toplanmaz.
            Randevu formundaki ad ve telefon sunucu tarafından otomatik üretilir, not kaydedilmez, kayıtlar her
            gece silinir. Aşağıdaki metin, şablonun gerçek bir salonda nasıl görüneceğini gösteren örnektir.
          </p>
        )}

        <p>
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, web sitemiz
          üzerinden randevu alırken paylaştığınız kişisel verilerin işlenmesi hakkında sizi bilgilendirmek için
          hazırlanmıştır.
        </p>

        <Section title="1. Veri sorumlusu">
          <p>
            <strong className="text-ink">{site.legalName}</strong>
            <br />
            Adres: {site.address}
            <br />
            Telefon: {site.phone}
          </p>
        </Section>

        <Section title="2. Hangi verilerinizi işliyoruz?">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-ink">Kimlik ve iletişim:</strong> adınız soyadınız ve telefon numaranız
            </li>
            <li>
              <strong className="text-ink">Randevu bilgisi:</strong> seçtiğiniz işlem, randevu tarihi ve saati
            </li>
            <li>
              <strong className="text-ink">Not:</strong> isterseniz yazdığınız not. Lütfen bu alana sağlık
              bilginizi (hastalık, ilaç, hamilelik vb.) yazmayın; gerekiyorsa randevunuzda yüz yüze konuşalım.
            </li>
          </ul>
          <p>
            Sitemiz ziyaretçilere reklam, takip veya analiz çerezi yerleştirmez.
          </p>
        </Section>

        <Section title="3. Hangi amaçla ve hangi hukuki sebeple?">
          <p>
            Verilerinizi randevunuzu oluşturmak, planlamak, onaylamak veya iptal etmek ve randevunuzla ilgili
            sizinle telefon ya da WhatsApp üzerinden iletişime geçmek amacıyla işliyoruz.
          </p>
          <p>
            Hukuki sebep: KVKK md. 5/2-c, <em>bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili
            olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin işlenmesinin gerekli olması</em>.
            Randevu talebiniz, bizden hizmet almak için kurulan ilişkinin başlangıcıdır. Bu nedenle ayrıca açık
            rızanızı istemiyoruz.
          </p>
        </Section>

        <Section title="4. Verilerinizi nasıl topluyoruz?">
          <p>
            Verileriniz, web sitemizdeki randevu formunu doldurmanız yoluyla elektronik ortamda toplanır.
          </p>
        </Section>

        <Section title="5. Verileriniz kimlere aktarılıyor?">
          <p>
            Verilerinizi üçüncü kişilerle reklam veya pazarlama amacıyla paylaşmıyoruz, satmıyoruz.
          </p>
          <p>
            Randevu kayıtları, veritabanı hizmeti aldığımız <strong className="text-ink">Supabase Inc.</strong>
            &apos;in {site.kvkk.databaseLocation} bulunan sunucularında saklanır. Supabase, verileri yalnızca
            bizim adımıza ve talimatımızla, veri işleyen sıfatıyla saklar.
          </p>
          <p>
            Web sitemiz <strong className="text-ink">{site.kvkk.hostingProvider}</strong> altyapısında
            barındırılır; form gönderdiğinizde bilgileriniz bu altyapı üzerinden veritabanına iletilir.
          </p>
          <p>
            Yeni randevu talebi geldiğinde bize bir e-posta bildirimi gönderilir. Bu e-postada adınız, telefon
            numaranız veya notunuz <strong className="text-ink">yer almaz</strong>; yalnızca işlem ve randevu
            saati bulunur.
          </p>
          <p>Kanunen yetkili kamu kurumları talep ederse, verileriniz yasal yükümlülük kapsamında paylaşılabilir.</p>
        </Section>

        <Section title="6. Ne kadar süre saklıyoruz?">
          <p>
            Randevu tarihinden <strong className="text-ink">2 yıl</strong> sonra adınız, telefon numaranız ve
            notunuz otomatik olarak silinir. Geriye yalnızca kimseyi tanımlamayan bilgiler (işlem ve tarih)
            istatistik amacıyla kalır.
          </p>
        </Section>

        <Section title="7. Haklarınız (KVKK md. 11)">
          <p>Bize başvurarak:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
            <li>işlenmişse buna ilişkin bilgi talep etme,</li>
            <li>işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
            <li>eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
            <li>KVKK md. 7&apos;deki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
            <li>düzeltme ve silme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
            <li>
              münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme,
            </li>
            <li>kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
          </ul>
          <p>haklarına sahipsiniz.</p>
        </Section>

        <Section title="8. Nasıl başvurabilirsiniz?">
          <p>
            Başvurunuzu, kimliğinizi doğrulayan bilgilerle birlikte yazılı olarak yukarıdaki adresimize
            iletebilirsiniz. Randevunuzla ilgili basit talepler (ör. randevu kaydınızın silinmesi) için bizi
            telefonla da arayabilirsiniz. Başvurunuz en geç 30 gün içinde ücretsiz olarak sonuçlandırılır.
          </p>
          <p>
            Başvurunuzun reddedilmesi, cevabı yetersiz bulmanız veya süresinde cevap verilmemesi hâlinde Kişisel
            Verileri Koruma Kurulu&apos;na şikâyette bulunabilirsiniz.
          </p>
        </Section>

        <p className="text-sm">Son güncelleme: {LAST_UPDATED}</p>
      </article>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-2xl font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}
