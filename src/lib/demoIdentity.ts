/*
 * DEMO KİMLİĞİ: demo sitesinde randevuya yazılan uydurma ad ve telefon.
 *
 * Ziyaretçi formda ne yazarsa yazsın (alanlar zaten kilitli) sunucu bunları
 * kullanır. Böylece veritabanına GERÇEK bir kayıt düşer (RPC, çakışma kuralı,
 * hız sınırı gerçekten çalışır) ama içinde kimseye ait kişisel veri olmaz.
 *
 * Telefon neden her seferinde farklı? 0015'teki kural aynı telefona en fazla
 * 3 ileri tarihli randevu izni veriyor. Hep "0500 000 00 00" yazsaydık demo
 * 3 randevudan sonra kilitlenirdi.
 *
 * "0500": cep operatörlerinin kullandığı öneklerden (501, 505, 53x, 54x, 55x…)
 * biri değil; numaranın gerçek birine denk gelmemesi için seçildi.
 * 11 rakam → veritabanındaki 10–13 rakam kontrolünden geçer.
 *
 * random parametresi: testte sabit değer verebilmek için (saf fonksiyon).
 */
export type DemoIdentity = { name: string; phone: string };

export function demoIdentity(random: () => number = Math.random): DemoIdentity {
  // random() 0 ile 1 arası (1 hariç) → 0000–9999
  const n = Math.min(9999, Math.floor(random() * 10000));
  const digits = String(n).padStart(4, "0");
  return { name: `Demo Misafir ${digits}`, phone: `0500000${digits}` };
}
