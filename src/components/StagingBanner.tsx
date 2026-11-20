import { site } from "@/lib/site";
import { isStaging } from "@/lib/staging";

/*
 * DENEME SÜRÜMÜ ŞERİDİ
 * Sadece SITE_STAGING=1 iken, her ziyaretçi sayfasının en üstünde görünür.
 * Linki bir şekilde bulan gerçek bir müşteri, buradan aldığı randevunun
 * geçerli olduğunu sanmasın diye. Gerçek açılışta değişken silinince kaybolur.
 */
export default function StagingBanner() {
  if (!isStaging) return null;

  return (
    <div role="note" className="bg-ink px-4 py-2 text-center text-sm text-white">
      <strong className="font-semibold">Deneme sürümü:</strong> Bu sitede alınan randevular geçerli değildir.
      {site.phone && (
        <>
          {" "}
          Randevu için bizi arayın:{" "}
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="font-medium whitespace-nowrap underline">
            {site.phone}
          </a>
        </>
      )}
    </div>
  );
}
