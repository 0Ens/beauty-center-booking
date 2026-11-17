import type { NextConfig } from "next";

// .env.local, next.config'den ÖNCE yüklenir → adres burada okunabilir
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
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
