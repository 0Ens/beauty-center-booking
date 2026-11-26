-- =====================================================================
-- ÖRNEK VERİ (seed): demo ve yeni kurulumlar için genel işlemler.
-- Salon sahibi işlemleri panelden düzenler.
-- Fiyatlar (price_min/max) şimdilik boş → sitede "fiyat için arayın".
-- sort_order 10, 20, 30... → araya yeni işlem eklemek kolay olsun (ör. 15).
-- =====================================================================

insert into services
  (slug, name, category, duration_min, summary, description, suitable_for, icon, featured, sort_order)
values
  ('derin-cilt-temizligi', 'Derin Cilt Temizliği', 'Cilt Bakımı', 75,
   'Gözenekleri arındıran, cildin nefes almasını sağlayan temel bakım.',
   'Cilt analizinin ardından cildinize uygun ürünlerle temizlik, peeling, gözenek temizliği ve maske uygulanır. Bakım sonunda cildiniz daha temiz, pürüzsüz ve canlı görünür.',
   array['Yağlı ve karma ciltler', 'Siyah nokta ve gözenek sorunu yaşayanlar', 'Mat ve yorgun görünen ciltler'],
   'droplets', true, 10),
  ('nem-ve-isilti-bakimi', 'Nem ve Işıltı Bakımı', 'Cilt Bakımı', 60,
   'Susuz kalmış cilde nem ve doğal bir ışıltı kazandırır.',
   'Yoğun nem veren serum ve maskelerle cildin nem dengesi desteklenir. Özel günler öncesinde ya da mevsim geçişlerinde tercih edilen rahatlatıcı bir bakımdır.',
   array['Kuru ve susuz ciltler', 'Özel gün öncesi ışıltı isteyenler'],
   'sparkles', true, 20),
  ('akne-bakimi', 'Akne Bakımı', 'Cilt Bakımı', 60,
   'Sivilceye eğilimli ciltler için dengeleyici ve arındırıcı bakım.',
   'Akneye eğilimli ciltler için yatıştırıcı ve dengeleyici ürünlerle yapılan bir bakımdır. Düzenli seanslar ve evde bakım önerileriyle desteklenir.',
   array['Sivilceye eğilimli ciltler', 'Ergenlik dönemi ciltleri'],
   'leaf', true, 30),
  ('leke-karsiti-bakim', 'Leke Karşıtı Bakım', 'Cilt Bakımı', 60,
   'Cilt tonunu eşitlemeye yardımcı, aydınlatıcı bakım.',
   'Aydınlatıcı içeriklerle yapılan bu bakım, daha eşit görünen bir cilt tonunu hedefler. Güneş koruması ve evde bakım önerileriyle birlikte uygulanır.',
   array['Güneş ve yaş lekesi olanlar', 'Cilt tonu eşitsizliği yaşayanlar'],
   'sun', false, 40),
  ('kas-laminasyonu', 'Kaş Laminasyonu', 'Kaş & Kirpik', 45,
   'Kaşlara düzenli, dolgun ve şekilli bir görünüm kazandırır.',
   'Kaş kılları istenen yöne sabitlenerek daha dolgun ve düzenli bir görünüm elde edilir. Uygulama sonrasında kaşlarınız haftalarca şeklini korur.',
   array['Dağınık ya da seyrek kaşları olanlar', 'Bakımlı ve doğal görünüm isteyenler'],
   'flower', true, 50),
  ('kirpik-lifting', 'Kirpik Lifting', 'Kaş & Kirpik', 60,
   'Kendi kirpiklerinize kalıcı bir kıvrım ve canlılık verir.',
   'Kirpikler kökten kıvrılarak daha uzun ve belirgin görünmesi sağlanır. Takma kirpik ya da her gün kirpik kıvırıcı kullanmadan doğal bir görünüm sunar.',
   array['Düz kirpikleri olanlar', 'Makyajsız da bakımlı görünmek isteyenler'],
   'eye', true, 60);

-- ÖNCESİ / SONRASI örnekleri
-- service_id elle yazılmıyor (id'leri ezbere bilemeyiz): slug ile services
-- tablosuna JOIN yapıp id'yi oradan alıyoruz.
insert into before_after
  (service_id, title, description, taken_on, before_url, after_url, is_featured, sort_order)
select s.id, v.title, v.description, v.taken_on::date, v.before_url, v.after_url, v.is_featured, v.sort_order
from (values
  ('akne-bakimi', 'Akne Bakımı',
   '6 seanslık bakım sonrası aktif sivilceler ve kızarıklık belirgin şekilde azaldı.',
   '2026-10-01', '/ornek/akne-oncesi.svg', '/ornek/akne-sonrasi.svg', true, 10),
  ('leke-karsiti-bakim', 'Leke Karşıtı Bakım',
   'Güneş lekeleri açıldı, cilt tonu daha eşit bir görünüm kazandı.',
   '2026-09-01', '/ornek/leke-oncesi.svg', '/ornek/leke-sonrasi.svg', true, 20),
  ('nem-ve-isilti-bakimi', 'Nem ve Işıltı Bakımı',
   'Tek seansta mat ve yorgun görünen cilde nem ve ışıltı kazandırıldı.',
   '2026-08-01', '/ornek/nem-oncesi.svg', '/ornek/nem-sonrasi.svg', false, 30),
  ('kas-laminasyonu', 'Kaş Laminasyonu',
   'Seyrek ve dağınık kaşlar daha dolgun ve düzenli bir şekle kavuştu.',
   '2026-10-01', '/ornek/kas-oncesi.svg', '/ornek/kas-sonrasi.svg', true, 40)
) as v(slug, title, description, taken_on, before_url, after_url, is_featured, sort_order)
join services s on s.slug = v.slug;

-- ÇALIŞMA SAATLERİ (örnek: Pazartesi–Cumartesi 10:00–19:00, Pazar kapalı)
insert into working_hours (weekday, is_closed, open_time, close_time) values
  (0, true,  null,    null),
  (1, false, '10:00', '19:00'),
  (2, false, '10:00', '19:00'),
  (3, false, '10:00', '19:00'),
  (4, false, '10:00', '19:00'),
  (5, false, '10:00', '19:00'),
  (6, false, '10:00', '19:00');

-- İZİN GÜNLERİ (örnek: yılbaşı)
insert into blocked_dates (starts_on, ends_on, reason) values
  ('2026-12-31', '2027-01-01', 'Yılbaşı tatili');
