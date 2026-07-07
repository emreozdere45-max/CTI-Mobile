# 13 - Testing

## Amaç

Bu belge, CTI-Mobile uygulamasının test stratejisini tanımlar. Amaç; mobil uygulama, backend API, veritabanı, AI entegrasyonu, bildirimler ve güvenlik kontrollerinin güvenilir şekilde çalıştığını kanıtlamaktır.

## Test Yaklaşımı

MVP aşamasında testler pratik ve doğrudan değer üreten alanlara odaklanır:

- Kritik kullanıcı akışları
- API sözleşmeleri
- Veritabanı işlemleri
- Güvenlik kontrolleri
- AI hata yönetimi
- Mobil ekran durumları

## Test Seviyeleri

### 1. Unit Test

Küçük kod parçalarının tek başına doğru çalıştığını doğrular.

Backend örnekleri:

- IOC tip algılama
- Risk seviyesi filtreleme
- Token doğrulama yardımcıları
- Bildirim tercih kontrolü

Mobil örnekleri:

- Form validasyonu
- State yönetimi
- Model parse işlemleri
- Risk etiketi renk/label eşleşmesi

### 2. Integration Test

Birden fazla parçanın birlikte doğru çalıştığını doğrular.

Örnekler:

- Login endpointi kullanıcıyı doğrular ve token üretir.
- IOC arama endpointi veritabanından doğru sonucu döner.
- AI özet endpointi tehdit verisini alıp özet kaydı oluşturur.
- Favori ekleme endpointi aynı kaydı iki kez eklemeyi engeller.

### 3. API Contract Test

Mobil uygulama ve backend arasındaki JSON sözleşmesinin bozulmadığını kontrol eder.

Kontrol edilecekler:

- Response alan adları
- HTTP durum kodları
- Hata formatı
- Pagination formatı
- Auth header gereksinimi

### 4. Mobile Widget Test

Flutter ekran bileşenlerinin doğru durumları gösterdiğini doğrular.

Örnekler:

- Dashboard yükleniyor durumu
- Tehdit listesi boş durum
- IOC arama validasyonu
- AI özeti hata durumu
- Favori butonu davranışı

### 5. End-to-End Test

Kullanıcının gerçek akışlarını baştan sona doğrular.

MVP E2E akışları:

- Kullanıcı giriş yapar ve dashboard görür.
- Kullanıcı tehdit listesine gider ve detay açar.
- Kullanıcı IOC araması yapar ve IOC detayını görür.
- Kullanıcı tehdidi favoriye ekler.
- Kullanıcı bildirim tercihlerini değiştirir.

## Backend Test Planı

Önerilen araçlar:

- Pytest
- HTTPX test client
- Testcontainers veya ayrı test PostgreSQL
- Coverage raporu

### Auth Testleri

Test senaryoları:

- Geçerli kullanıcı giriş yapabilir.
- Hatalı parola giriş yapamaz.
- Eksik alanlar validation hatası döner.
- Token olmadan protected endpoint çalışmaz.
- Geçerli token ile protected endpoint çalışır.

### Threat Testleri

Test senaryoları:

- Tehdit listesi döner.
- Severity filtresi çalışır.
- Tehdit detayı doğru IOC ilişkileriyle döner.
- Var olmayan tehdit için 404 döner.
- Pagination meta bilgisi doğru döner.

### IOC Testleri

Test senaryoları:

- Domain araması doğru tip algılar.
- IP araması doğru tip algılar.
- Hash araması doğru tip algılar.
- Kayıt yoksa boş sonuç döner.
- IOC detayı ilişkili tehditleri içerir.

### AI Testleri

Test senaryoları:

- Tehdit için kısa özet oluşturulur.
- AI sağlayıcı hatasında güvenli hata döner.
- AI çıktısı veritabanına kaydedilir.
- Yetkisiz kullanıcı AI endpointini çağıramaz.
- Aynı tehdit için cache kullanımı desteklenir.

### Favorites Testleri

Test senaryoları:

- Kullanıcı tehdit favorisi ekleyebilir.
- Kullanıcı IOC favorisi ekleyebilir.
- Aynı favori ikinci kez eklenemez.
- Kullanıcı favorisini silebilir.
- Kullanıcı sadece kendi favorilerini görür.

### Notifications Testleri

Test senaryoları:

- Cihaz tokenı kaydedilir.
- Bildirim tercihi güncellenir.
- Silent kullanıcıya push gönderilmez.
- Critical tehdide uygun kullanıcılar seçilir.
- Geçersiz token pasif yapılabilir.

## Mobil Test Planı

Önerilen araçlar:

- Flutter test
- Widget test
- Integration test
- Mock API client

### Giriş Ekranı

Test senaryoları:

- Boş e-posta uyarı verir.
- Boş parola uyarı verir.
- Hatalı girişte hata mesajı gösterilir.
- Başarılı girişte dashboard açılır.

### Dashboard

Test senaryoları:

- Yükleniyor durumu görünür.
- Kritik ve yüksek tehdit sayıları gösterilir.
- Top threats listelenir.
- Hata durumunda tekrar dene gösterilir.

### Tehdit Listesi

Test senaryoları:

- Liste verileri render edilir.
- Filtre seçimi listeyi günceller.
- Boş filtre sonucu mesajı gösterilir.
- Tehdit kartına dokununca detay açılır.

### IOC Arama

Test senaryoları:

- Geçersiz giriş uyarı verir.
- Geçerli domain araması başlatılır.
- Sonuç yoksa boş durum gösterilir.
- Sonuç varsa detay ekranına gidilir.

### Ayarlar

Test senaryoları:

- Bildirim tercihi değiştirilebilir.
- Tema tercihi değiştirilebilir.
- Çıkış yapma akışı çalışır.

## Güvenlik Testleri

MVP güvenlik kontrolleri:

- Token olmadan protected endpointlere erişilemez.
- Kullanıcı başka kullanıcının favorilerini göremez.
- Hatalı login denemeleri rate limit ile sınırlandırılır.
- Hata mesajları sistem detayı sızdırmaz.
- Push bildirimi hassas veri içermez.
- AI endpointi kullanıcı yetkisi kontrol eder.

## Test Verisi

Seed veri önerisi:

- 5 kullanıcı
- 6 rol
- 3 kaynak
- 20 tehdit
- 60 IOC
- 10 tehdit-IOC ilişkisi
- 5 favori
- 5 bildirim

Seed veri; demo, local geliştirme ve testler için kullanılacaktır.

## CI Test Aşamaları

Pull request açıldığında:

1. Backend lint
2. Backend unit test
3. Backend API test
4. Mobile format kontrolü
5. Mobile unit/widget test
6. Security dependency scan

Main branch için:

1. Tüm PR testleri
2. Integration test
3. Docker build
4. Staging deployment

## Test Kapsam Hedefleri

MVP için hedefler:

- Backend kritik modüller: en az yüzde 70 coverage
- Mobil core ve feature logic: en az yüzde 60 coverage
- Auth, IOC arama ve threat detail akışları: zorunlu testli

Not:

Coverage tek başına kalite göstergesi değildir. Kritik iş akışlarının doğru testlenmesi daha önemlidir.

## Manual QA Kontrol Listesi

Yayın öncesi manuel kontrol:

- Giriş yapılabiliyor.
- Dashboard verileri görünüyor.
- Tehdit listesi açılıyor.
- Tehdit detayı açılıyor.
- IOC arama çalışıyor.
- Favori ekleme/silme çalışıyor.
- AI özeti oluşturuluyor.
- Bildirim tercihi kaydediliyor.
- Çıkış yapılabiliyor.
- Ağ hatasında ekran bozulmuyor.

## MVP Kabul Kriterleri

- Auth, threats, iocs, favorites ve AI endpointleri testlidir.
- Mobil ana ekranların yükleniyor, veri, boş ve hata durumları testlidir.
- CI testleri pull requestlerde çalışır.
- Yayın öncesi manuel QA listesi tamamlanır.
- Kritik güvenlik kontrolleri doğrulanır.

