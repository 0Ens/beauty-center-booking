import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

/*
 * PAYLAŞIM GÖRSELİ (Open Graph image)
 * Site linki WhatsApp, Instagram, Facebook'ta paylaşılınca kartta çıkan resim.
 * Dosya app/ kökünde olduğu için TÜM sayfalarda geçerli.
 *
 * Görseli elle çizmek yerine kodla üretiyoruz: ImageResponse, JSX'i PNG'ye
 * çeviriyor. Salon adı, slogan ya da amblem değişirse görsel de kendiliğinden değişir.
 * Sınırlama: sadece flexbox ve CSS'in bir alt kümesi çalışır (grid yok), CSS
 * değişkenleri de yok; bu yüzden renkler globals.css'teki tonların kopyası.
 *
 * 1200×630: Facebook/WhatsApp'ın önerdiği boyut (1.91:1).
 */
export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// MARKA AYARLARI: globals.css → brand-700, ink-soft, blush-100
const colors = { title: "#a8466a", subtitle: "#6e5c63", background: "#fae1e9" };

export default async function Image() {
  // Amblemi diskten okuyup resmin içine gömüyoruz ("data:" adresi; SVG de olur)
  const logo = await readFile(join(process.cwd(), "public/logo-mark.svg"));
  const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(180deg, #ffffff 0%, ${colors.background} 100%)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse next/image'ı desteklemiyor */}
        <img src={logoSrc} width={220} height={220} alt="" />
        <div style={{ fontSize: 76, color: colors.title, marginTop: 24 }}>{site.name}</div>
        <div style={{ fontSize: 34, color: colors.subtitle, marginTop: 18 }}>{site.tagline}</div>
      </div>
    ),
    size,
  );
}
