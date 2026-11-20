import type { NextConfig } from "next";
import { isStaging } from "./src/lib/staging";

// .env.local, next.config'den ÖNCE yüklenir → adres burada okunabilir
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const isDev = process.env.NODE_ENV === "development";

/*
 * GÜVENLİK BAŞLIKLARI: her cevaba eklenen, tarayıcıya "bu sitede neye izin var"
 * diyen kurallar. Sitede bir açık olsa bile zararı sınırlarlar (ikinci kilit).
 *
 * CONTENT-SECURITY-POLICY (CSP): sayfa nereden ne yükleyebilir?
 *   default-src 'self'      → aksi söylenmedikçe sadece kendi adresimizden
 *   script-src              → JS sadece bizden. 'unsafe-inline' şart: Next sayfaya
 *                             küçük satır içi script'ler koyuyor. Bunun daha sıkı yolu
 *                             (nonce) her sayfayı her istekte yeniden üretmeyi gerektirir;
 *                             sitemiz çoğunlukla hazır (statik) sayfa, hızını kaybederdi.
 *                             'unsafe-eval' sadece geliştirmede (React hata ayıklaması için).
 *   img-src                 → resimler: kendimiz + Supabase (paneldeki önizlemeler
 *                             doğrudan oradan gelir) + blob: (yükleme öncesi önizleme)
 *   object-src 'none'       → eski eklentiler (Flash vb.) hiç yok
 *   base-uri 'self'         → biri sayfaya <base> sokup linkleri başka yere çeviremesin
 *   form-action 'self'      → formlar sadece bize gönderilebilir
 *   frame-ancestors 'none'  → site başka bir sitenin içine (iframe) gömülemez.
 *                             "Clickjacking"e karşı: görünmez bir çerçevede salon sahibinin
 *                             paneline tıklatma hilesi yapılamaz.
 *   upgrade-insecure-requests → http:// ile istenen her şey https:// ile istenir
 *                             (geliştirmede yok: telefon http://172.20.10.x ile açıyor)
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data:${supabaseUrl ? ` ${supabaseUrl}` : ""}`,
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Tarayıcı, dosya türünü tahmin etmeye çalışmasın; sunucu ne diyorsa o
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Başka siteye giden linkte sadece alan adımız görünsün, sayfa yolu değil
  // (ör. /admin/... adresleri dışarıya sızmasın)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Kamera, mikrofon, konum gibi özellikleri hiç kullanmıyoruz; kapalı kalsınlar
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // HSTS: "bu siteye 2 yıl boyunca SADECE https ile gel". Yalnızca yayında
  // (localhost'ta https yok). "preload" eklemedik: o, tarayıcıların listesine
  // kalıcı girmek demek; geri almak aylar sürer.
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
  // DENEME SÜRÜMÜ (SITE_STAGING=1): "bu adresteki HİÇBİR şeyi dizine ekleme".
  // <meta> etiketinden farkı: başlık her cevaba eklenir (sayfalar, resimler,
  // sitemap, robots.txt) → hiçbir dosya arama sonuçlarına düşmez.
  ...(isStaging ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
];

const nextConfig: NextConfig = {
  // "X-Powered-By: Next.js" başlığını gönderme: saldırgana kullandığımız yazılımı söylemeye gerek yok
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    /*
     * next/image dış adresteki görseli ancak izin verilirse optimize eder.
     * Sadece BİZİM Supabase projemizin "before-after" kovasına izin var;
     * başka bir adres verilirse 400 döner (sunucumuz başkalarının
     * görsellerini işlemek için kullanılamasın).
     */
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/before-after/**`)] : [],
  },
  experimental: {
    serverActions: {
      /*
       * Server Action'a gelen istek varsayılan olarak en fazla 1 MB.
       * Öncesi/sonrası formu iki fotoğraf gönderiyor (her biri en fazla
       * 2 MB, bkz. 0013); form alanları ve multipart ek baytları için pay bırakıldı.
       */
      bodySizeLimit: "5mb",
    },
  },
  /*
   * Geliştirme sunucusu varsayılan olarak sadece "localhost"tan gelen
   * isteklere JS dosyalarını verir (güvenlik). Telefon siteyi bilgisayarın
   * ağ IP'siyle açtığı için ona izin veriyoruz. iPhone hotspot'u her zaman
   * 172.20.10.x adreslerini dağıtır; * = son kısım ne olursa olsun.
   * Sadece "npm run dev" için geçerli, yayındaki siteyi etkilemez.
   */
  allowedDevOrigins: ["172.20.10.*"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
