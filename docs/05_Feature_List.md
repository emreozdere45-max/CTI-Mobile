# 05 - Feature List

## Amaç

Bu belge, CTI-Mobile uygulamasının özelliklerini MVP, V1 ve gelecek sürümler olarak önceliklendirir. Her özellik kullanıcı değeri, kapsam ve kabul kriterleriyle tanımlanır.

## Öncelik Seviyeleri

- MVP: İlk çalışan ürün için gerekli özellikler.
- V1: MVP sonrası ürünü güçlendirecek özellikler.
- Future: Daha olgun sürümlerde değerlendirilecek gelişmiş özellikler.

## MVP Özellikleri

### F-001 - Güvenli Giriş

Öncelik: MVP

Açıklama: Kullanıcı uygulamaya güvenli biçimde giriş yapar ve yetkili olduğu verilere erişir.

Kullanıcı değeri: Tehdit istihbaratı verileri yetkisiz erişime karşı korunur.

Kabul kriterleri:

- E-posta/parola ile giriş desteklenir.
- Başarısız girişte genel ve güvenli hata mesajı gösterilir.
- Oturum bilgisi güvenli saklanır.
- Oturum süresi dolduğunda kullanıcı giriş ekranına döner.

### F-002 - Ana Dashboard

Öncelik: MVP

Açıklama: Kullanıcı kritik tehditleri, son tehditleri ve genel risk durumunu tek ekranda görür.

Kullanıcı değeri: Kullanıcı uygulamayı açar açmaz neye odaklanacağını anlar.

Kabul kriterleri:

- Kritik ve yüksek seviye tehditler öne çıkar.
- Son tehditler listelenir.
- Tehdit seviyeleri görsel olarak ayrıştırılır.
- Kullanıcı tehdit detayına geçebilir.

### F-003 - Tehdit Akışı

Öncelik: MVP

Açıklama: Güncel tehditler liste halinde gösterilir.

Kullanıcı değeri: Analistler yeni tehditleri sürekli takip edebilir.

Kabul kriterleri:

- Tehdit başlığı, kaynak, tarih ve seviye gösterilir.
- Liste yenilenebilir.
- Kullanıcı arama ve temel filtreleme yapabilir.
- Boş, yükleniyor ve hata durumları tasarlanır.

### F-004 - Tehdit Detay Sayfası

Öncelik: MVP

Açıklama: Bir tehdidin açıklaması, seviyesi, kaynakları, IOC'leri ve önerilen aksiyonları detaylı gösterilir.

Kullanıcı değeri: Kullanıcı sadece başlığı değil, tehdidin bağlamını ve yapılması gerekenleri anlar.

Kabul kriterleri:

- Tehdit açıklaması ve risk seviyesi görünür.
- Kaynak ve tarih bilgisi gösterilir.
- İlişkili IOC listesi bulunur.
- Önerilen aksiyonlar ayrı bölümde yer alır.

### F-005 - IOC Arama

Öncelik: MVP

Açıklama: Kullanıcı IP, domain, URL, hash veya e-posta göstergesi arayabilir.

Kullanıcı değeri: SOC ve IR ekipleri alarmdaki göstergenin riskini hızlı doğrular.

Kabul kriterleri:

- Tek arama alanı farklı IOC tiplerini kabul eder.
- Sonuçlar risk seviyesiyle gösterilir.
- Sonuç yoksa anlaşılır boş durum gösterilir.
- Hatalı formatta kullanıcı yönlendirilir.

### F-006 - IOC Detay Sayfası

Öncelik: MVP

Açıklama: Aranan göstergenin tipi, değeri, risk skoru, ilişkili tehditleri ve kaynak bilgileri gösterilir.

Kullanıcı değeri: Kullanıcı göstergenin sadece zararlı olup olmadığını değil, neden önemli olduğunu da anlar.

Kabul kriterleri:

- IOC tipi ve değeri gösterilir.
- Risk skoru bulunur.
- İlişkili tehditler listelenir.
- İlk görülme ve son görülme alanları desteklenir.

### F-007 - AI Kısa Özet

Öncelik: MVP

Açıklama: Uzun tehdit raporları kısa, okunabilir ve aksiyon odaklı özetlere dönüştürülür.

Kullanıcı değeri: Kullanıcı uzun rapor okumadan tehdidin önemini anlayabilir.

Kabul kriterleri:

- Özet 3-5 madde halinde üretilir.
- Özet kaynak tehdit bağlamına bağlıdır.
- Kullanıcı AI özetinin üretildiğini açıkça görür.
- AI hata durumunda normal tehdit içeriği erişilebilir kalır.

### F-008 - Kritik Bildirimler

Öncelik: MVP

Açıklama: Kritik veya yüksek öncelikli tehditler için kullanıcıya push bildirimi gönderilir.

Kullanıcı değeri: Kullanıcı önemli tehditleri uygulamayı açmadan fark eder.

Kabul kriterleri:

- Kritik tehdit bildirimi gönderilir.
- Bildirime dokununca ilgili tehdit detayı açılır.
- Kullanıcı bildirim iznini yönetebilir.
- Bildirim içeriği hassas veriyi gereksiz açığa çıkarmaz.

### F-009 - Favoriler

Öncelik: MVP

Açıklama: Kullanıcı önemli tehdit veya IOC kayıtlarını favorilere ekler.

Kullanıcı değeri: Kullanıcı tekrar inceleyeceği kayıtlara hızlı erişir.

Kabul kriterleri:

- Tehdit favorilere eklenebilir.
- IOC favorilere eklenebilir.
- Favoriler ayrı ekranda listelenir.
- Favori durumu kullanıcı hesabında korunur.

### F-010 - Temel Ayarlar

Öncelik: MVP

Açıklama: Kullanıcı profil, tema ve bildirim tercihlerini yönetir.

Kullanıcı değeri: Uygulama kullanıcının çalışma biçimine uyum sağlar.

Kabul kriterleri:

- Profil bilgisi görüntülenir.
- Bildirim seviyesi ayarlanabilir.
- Tema tercihi desteklenir.
- Çıkış yapma aksiyonu bulunur.

## V1 Özellikleri

### F-011 - Rol Bazlı Yetkilendirme

Öncelik: V1

Açıklama: Kullanıcılar rollerine göre farklı ekranlara, detay seviyelerine ve yönetim işlemlerine erişir.

Kullanıcı değeri: Hassas istihbarat verileri kontrollü biçimde paylaşılır.

Kabul kriterleri:

- CTI analisti, SOC analisti, yönetici ve CISO rolleri tanımlanır.
- Rol bazlı menü ve ekran erişimi uygulanır.
- Yetkisiz erişim engellenir.

### F-012 - Gelişmiş Filtreleme

Öncelik: V1

Açıklama: Tehditler sektör, ülke, kaynak, etiket, güven skoru ve tarih aralığına göre filtrelenir.

Kullanıcı değeri: Analist ilgisiz kayıtları eleyip doğru tehdide ulaşır.

Kabul kriterleri:

- Birden fazla filtre aynı anda çalışır.
- Filtreler kaydedilebilir.
- Sonuç sayısı gösterilir.

### F-013 - AI Teknik Özet

Öncelik: V1

Açıklama: AI, tehdidin teknik detaylarını IOC, TTP ve savunma adımları olarak özetler.

Kullanıcı değeri: SOC ve IR ekipleri teknik aksiyonu daha hızlı çıkarır.

Kabul kriterleri:

- IOC'ler ayrı bölümde gösterilir.
- MITRE ATT&CK taktik/teknik eşlemesi desteklenir.
- Savunma önerileri listelenir.

### F-014 - AI Yönetici Özeti

Öncelik: V1

Açıklama: AI, teknik tehdidi iş etkisi ve yönetim aksiyonlarıyla açıklar.

Kullanıcı değeri: CISO ve yöneticiler hızlı karar alır.

Kabul kriterleri:

- İş etkisi sade dille açıklanır.
- Önerilen yönetim aksiyonları verilir.
- Teknik ayrıntılar azaltılır ama doğruluk korunur.

### F-015 - Audit Log

Öncelik: V1

Açıklama: Uygulamadaki önemli güvenlik olayları denetim için kaydedilir.

Kullanıcı değeri: Kurum, kim hangi veriye ne zaman erişti sorusuna cevap bulur.

Kabul kriterleri:

- Giriş, çıkış, arama ve detay görüntüleme loglanır.
- Loglar hassas veriyi maskeleyerek saklar.
- Yönetici logları filtreleyebilir.

### F-016 - Kaynak Yönetimi

Öncelik: V1

Açıklama: Tehdit istihbaratı kaynakları yönetilir ve güven seviyeleri belirlenir.

Kullanıcı değeri: Uygulamada gösterilen verinin güvenilirliği artar.

Kabul kriterleri:

- Kaynak adı, tip ve durum alanları bulunur.
- Kaynak aktif/pasif yapılabilir.
- Kaynak güven skoru tanımlanır.

## Future Özellikleri

### F-017 - MISP Entegrasyonu

Öncelik: Future

Açıklama: MISP üzerinden event, attribute ve IOC verileri alınır.

Beklenen değer: Kurumların mevcut CTI ekosistemiyle entegrasyon sağlanır.

### F-018 - OpenCTI Entegrasyonu

Öncelik: Future

Açıklama: OpenCTI platformundaki tehdit aktörleri, kampanyalar ve IOC'ler uygulamaya bağlanır.

Beklenen değer: Tehdit bağlamı zenginleşir.

### F-019 - SIEM Entegrasyonu

Öncelik: Future

Açıklama: SIEM alarmlarıyla CTI verileri eşleştirilir.

Beklenen değer: Operasyonel alarm önceliklendirme güçlenir.

### F-020 - Takım Yorumları

Öncelik: Future

Açıklama: Kullanıcılar tehdit veya IOC üzerine yorum bırakır.

Beklenen değer: Ekip içi analiz bilgisi uygulama içinde kalır.

### F-021 - Varlık Bazlı Risk Eşleştirme

Öncelik: Future

Açıklama: Tehditler kurum varlıklarıyla eşleştirilerek etki skoru hesaplanır.

Beklenen değer: Genel tehdit bilgisi kurum özelinde anlam kazanır.

### F-022 - Gelişmiş AI Analist Modu

Öncelik: Future

Açıklama: Kullanıcı AI'a tehdit hakkında kontrollü sorular sorabilir.

Beklenen değer: Analist, tehdit araştırmasını mobilde hızlandırır.

## MVP Ekran Haritası

| Ekran | İlgili Özellikler |
| --- | --- |
| Giriş | F-001 |
| Dashboard | F-002, F-003, F-008 |
| Tehdit Listesi | F-003, F-012 |
| Tehdit Detayı | F-004, F-007, F-009 |
| IOC Arama | F-005 |
| IOC Detayı | F-006, F-009 |
| Favoriler | F-009 |
| Ayarlar | F-010 |

## MVP Başarı Ölçütleri

- Kullanıcı girişten tehdit detayına en fazla 3 dokunuşta ulaşır.
- IOC araması normal koşullarda 2 saniye içinde sonuç verir.
- AI kısa özeti kullanıcıya teknik doğruluğu koruyan okunabilir çıktı sunar.
- Kritik bildirimden ilgili tehdit detayına doğrudan geçilir.
- Uygulama temel offline veya zayıf bağlantı durumlarını anlaşılır biçimde yönetir.

