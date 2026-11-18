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
 * çeviriyor. Salon adı değişirse görsel de kendiliğinden değişir.
 * Sınırlama: sadece flexbox ve CSS'in bir alt kümesi çalışır (grid yok).
 *
 * 1200×630: Facebook/WhatsApp'ın önerdiği boyut (1.91:1).
 */
export const alt = `${site.name}: Örnekşehir'de cilt bakımı, kaş ve kirpik uygulamaları`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Logoyu diskten okuyup resmin içine gömüyoruz (base64 "data:" adresi)
  const logo = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

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
          background: "linear-gradient(180deg, #ffffff 0%, #fae1e9 100%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse next/image'ı desteklemiyor */}
        <img src={logoSrc} width={320} height={320} alt="" style={{ marginTop: -40 }} />
        <div style={{ fontSize: 76, color: "#a8466a", marginTop: -30 }}>{site.name}</div>
        <div style={{ fontSize: 34, color: "#6e5c63", marginTop: 18 }}>
          Cilt bakımı · Kaş ve kirpik · Örnekşehir
        </div>
      </div>
    ),
    size,
  );
}
