import { cacheLife } from "next/cache";

/*
 * Next.js 16 (cacheComponents açık) sayfaları önceden HTML'e çevirirken
 * new Date() gibi "her an değişebilen" değerlere izin vermez; ne kadar süre
 * önbellekte tutulabileceğini bizim söylememizi ister.
 * Yıl yılda bir değişir → günde bir yenilenmesi fazlasıyla yeterli.
 */
export default async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
