import { site } from "@/lib/site";
import { isDemo, isStaging } from "@/lib/siteMode";

/*
 * MOD ŞERİDİ: her ziyaretçi sayfasının en üstünde, sadece deneme ve demo modunda.
 * Linki bir şekilde bulan biri buradan aldığı randevunun geçerli olduğunu sanmasın.
 * SITE_MODE=production (ya da boş) iken hiç görünmez.
 */
export default function SiteModeBanner() {
  if (isDemo) {
    return (
      <div role="note" className="bg-ink px-4 py-2 text-center text-sm text-white">
        <strong className="font-semibold">Demo site:</strong> {site.name} hayali bir işletmedir. Randevu
        sistemini deneyebilirsiniz; ad ve telefon otomatik üretilir, kayıtlar her gece silinir.
      </div>
    );
  }

  if (isStaging) {
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

  return null;
}
