import { Sparkles } from "lucide-react";
import NotFoundContent from "@/components/NotFoundContent";

/*
 * İŞLEM DETAYI 404
 *
 * page.tsx'teki notFound() buraya düşer (en yakın not-found.tsx kazanır).
 * Örnek: Instagram'da paylaşılmış bir işlem panelden pasife alındıysa,
 * ziyaretçi genel "sayfa yok" yerine işlem listesine yönlendirilir.
 *
 * Bu klasör (site) grubunun içinde: menü ve footer layout'tan zaten geliyor.
 */
export default function ServiceNotFound() {
  return (
    <NotFoundContent
      title="Bu işlem bulunamadı"
      message="Aradığınız işlem artık sunulmuyor ya da adı değişmiş olabilir. Güncel işlemlerimize göz atabilirsiniz."
      secondary={{ href: "/islemlerimiz", label: "Tüm İşlemlerimiz", icon: Sparkles }}
    />
  );
}
