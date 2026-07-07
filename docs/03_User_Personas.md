# 03 - User Personas

## Amaç

Bu belge, CTI-Mobile uygulamasını kullanacak ana kullanıcı tiplerini tanımlar. Personalar; ürün kararları, ekran öncelikleri, bildirim davranışları, AI özellikleri ve yetkilendirme modeli için referans alınacaktır.

## Persona 1: CTI Analisti

### Rol

Siber tehdit istihbaratı kaynaklarını takip eder, yeni tehditleri analiz eder, IOC'leri değerlendirir ve kurum için anlamlı istihbarat çıktıları üretir.

### Hedefleri

- Güncel tehdit kampanyalarını hızlı takip etmek
- IOC'leri bağlamıyla birlikte değerlendirmek
- Uzun raporları kısa ve aksiyon alınabilir hale getirmek
- Tehditleri sektör, kaynak ve ciddiyet seviyesine göre sınıflandırmak

### Ağrıları

- Tehdit raporları uzun, dağınık ve farklı kaynaklara yayılmıştır
- IOC'lerin güvenilirlik seviyesi her zaman net değildir
- Mobilde hızlı analiz ve rapor okuma deneyimi zayıftır
- Acil tehditleri düşük öncelikli içerikten ayırmak zaman alır

### Uygulamadan Beklentileri

- Güven skoru olan tehdit akışı
- IOC detay sayfası
- AI destekli teknik özet
- İlgili tehditler ve kampanyalar arasında bağlantı
- Favori ve takip listesi

### Başarı Senaryosu

Analist, sabah gelen kritik bildirime dokunur, tehdit özetini okur, ilişkili IOC'leri inceler ve 2 dakika içinde SOC ekibine aksiyon önerisi çıkarır.

## Persona 2: SOC Analisti

### Rol

Güvenlik alarmlarını izler, olayları önceliklendirir ve şüpheli göstergeleri hızlıca doğrular.

### Hedefleri

- Alarmdaki IP, domain, URL veya hash bilgisini hızlı kontrol etmek
- Tehdidin kurum için acil olup olmadığını anlamak
- Gerektiğinde olayı üst seviyeye taşımak
- Mobilde nöbet sırasında kritik bilgilere erişmek

### Ağrıları

- Çok fazla alarm vardır ve hepsi aynı önemde görünür
- IOC araştırması için birden fazla araca geçmek gerekir
- Uzun CTI raporları SOC temposunda okunması zor belgelerdir
- Mobilde karar vermeyi kolaylaştıran sade ekranlar yoktur

### Uygulamadan Beklentileri

- Hızlı IOC arama
- Risk seviyesi ve kısa açıklama
- Önerilen ilk aksiyonlar
- Kritik bildirimler
- Basit ve hızlı tehdit detayı

### Başarı Senaryosu

SOC analisti, SIEM alarmında gördüğü domaini mobil uygulamada arar, yüksek risk sonucunu görür ve domain engelleme sürecini başlatır.

## Persona 3: Incident Response Uzmanı

### Rol

Aktif olaylara müdahale eder, tehdit kapsamını belirler, kanıt toplar ve iyileştirme adımlarını yürütür.

### Hedefleri

- Olayla ilişkili IOC'leri hızlı gruplamak
- Tehdidin taktik, teknik ve prosedürlerini anlamak
- Aksiyon listesini net görmek
- Saha veya toplantı sırasında mobil erişim sağlamak

### Ağrıları

- Olay sırasında bilgi parçaları farklı sistemlere dağılır
- Hangi IOC'nin daha kritik olduğu net olmayabilir
- Müdahale sırasında uzun rapor okumaya zaman yoktur
- Ekipler arası bilgi aktarımı gecikebilir

### Uygulamadan Beklentileri

- Tehdit detayında aksiyon listesi
- İlişkili IOC ve kampanya görünümü
- AI ile müdahale özeti
- Favorilere alma ve paylaşılabilir kısa özet
- Kritik güncelleme bildirimi

### Başarı Senaryosu

IR uzmanı, aktif olayla ilişkili hash değerini arar, ilişkili kampanyayı görür, önerilen izolasyon ve avcılık adımlarını uygulama üzerinden okur.

## Persona 4: Güvenlik Operasyon Yöneticisi

### Rol

SOC ve CTI ekiplerinin iş yükünü, önceliklerini ve operasyonel riskleri yönetir.

### Hedefleri

- Kritik tehditlerin genel durumunu görmek
- Ekibin neye odaklanması gerektiğini anlamak
- Günlük veya haftalık tehdit görünümü almak
- Kurum açısından yüksek etkili tehditleri ayırmak

### Ağrıları

- Teknik detay çok fazladır, yönetilebilir özet azdır
- Ekip öncelikleri netleşmeyebilir
- Hangi tehdidin kurumu etkilediğini anlamak zaman alır
- Kritik olaylar geç fark edilebilir

### Uygulamadan Beklentileri

- Yönetici dashboard'u
- Önceliklendirilmiş tehdit listesi
- AI destekli yönetici özeti
- Kritik trendler
- Bildirim ayarları

### Başarı Senaryosu

Yönetici, gün başında mobil dashboard'u açar, kurum sektörünü etkileyen üç kritik tehdidi görür ve ekibin günlük odağını belirler.

## Persona 5: CISO / Güvenlik Lideri

### Rol

Kurumun siber risk stratejisini yönetir, üst yönetime raporlama yapar ve güvenlik yatırımlarını önceliklendirir.

### Hedefleri

- Kurumu etkileyebilecek yüksek seviye tehditleri takip etmek
- Teknik olmayan ama doğru özetler almak
- Risk trendlerini hızlı anlamak
- Kritik durumlarda bilgilendirilmek

### Ağrıları

- Teknik raporlar karar seviyesi için fazla ayrıntılıdır
- Riskin iş etkisi her zaman açık değildir
- Mobilde güvenilir ve kısa yönetici görünümü eksiktir
- Gereksiz bildirimler dikkat dağıtır

### Uygulamadan Beklentileri

- Kısa yönetici özeti
- İş etkisi açıklaması
- Kritik risk bildirimi
- Haftalık tehdit görünümü
- Güvenli ve sade mobil deneyim

### Başarı Senaryosu

CISO, kritik fidye yazılımı kampanyası bildirimi alır, kurum etkisini ve önerilen yönetim aksiyonlarını kısa özet halinde okur.

## Ortak Kullanıcı İhtiyaçları

- Hızlı ve güvenli giriş
- Sade dashboard
- Güvenilir tehdit skoru
- IOC arama
- Filtreleme ve önceliklendirme
- AI destekli özetleme
- Kritik bildirimler
- Rol bazlı görünüm
- Kayıtlı/favori tehditler

## Ürün Kararlarına Etkisi

- MVP'de en güçlü iki akış dashboard ve IOC arama olmalıdır.
- AI özellikleri sadece sohbet gibi değil, doğrudan analiz ve özet üretimi için konumlandırılmalıdır.
- Bildirimler rol bazlı ve önem seviyesine göre filtrelenmelidir.
- Yönetici kullanıcılar için teknik detay yerine kısa risk ve etki özeti öne çıkarılmalıdır.
- Analist kullanıcılar için kaynak, IOC, etiket ve güven skoru görünür olmalıdır.

