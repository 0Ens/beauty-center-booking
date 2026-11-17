import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
