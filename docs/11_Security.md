# 11 - Security

## Amaç

Bu belge, CTI-Mobile uygulamasının güvenlik yaklaşımını tanımlar. Uygulama siber tehdit istihbaratı verileriyle çalışacağı için kimlik doğrulama, yetkilendirme, veri koruma, loglama ve güvenli AI kullanımı en baştan tasarıma dahil edilmelidir.

## Güvenlik İlkeleri

- Varsayılan olarak güvenli tasarım
- En az yetki prensibi
- Hassas veriyi gereksiz saklamama
- Tüm yetki kontrollerini backend tarafında yapma
- Loglarda gizli bilgi tutmama
- Mobil uygulamada gizli anahtar saklamama

## Korunacak Varlıklar

Ana varlıklar:

- Kullanıcı hesapları
- Access token ve refresh token
- Tehdit istihbaratı verileri
- IOC kayıtları
- AI özetleri
- Audit loglar
- Push notification tokenları
- API anahtarları

## Kimlik Doğrulama

MVP:

- E-posta/parola ile giriş
- JWT access token
- Refresh token
- Oturum süresi sınırı

V1:

- MFA
- SSO
- Kurumsal kimlik sağlayıcı entegrasyonu

## Parola Güvenliği

Kurallar:

- Parola düz metin saklanmaz.
- Güçlü hash algoritması kullanılır.
- Başarısız giriş denemeleri rate limit ile sınırlandırılır.
- Hata mesajları kullanıcı varlığını açık etmez.

Örnek güvenli hata mesajı:

```text
E-posta veya parola hatalı.
```

## Yetkilendirme

Rol bazlı erişim kontrolü uygulanır.

Roller:

- cti_analyst
- soc_analyst
- incident_responder
- security_manager
- ciso
- admin

Temel kurallar:

- Her protected endpoint token doğrular.
- Rol kontrolü backend tarafında yapılır.
- Mobil UI sadece kolaylık sağlar; güvenlik sınırı backend'dir.
- Admin işlemleri ayrı yetki ister.

## Veri Güvenliği

Transit:

- Tüm API trafiği HTTPS üzerinden yapılır.

Storage:

- Mobil tokenlar secure storage içinde tutulur.
- Backend secrets ortam değişkenleri veya secret manager içinde saklanır.
- Veritabanı erişimi sınırlı kullanıcıyla yapılır.

Loglama:

- Token loglanmaz.
- Parola loglanmaz.
- API anahtarı loglanmaz.
- Hassas payload alanları maskelenir.

## Mobil Güvenlik

Mobil uygulama:

- API anahtarı içermez.
- Tokenları güvenli storage içinde tutar.
- Oturum süresi dolunca kullanıcıyı giriş ekranına yönlendirir.
- Root/jailbreak tespiti V1'de değerlendirilebilir.
- Hassas ekranlarda ekran görüntüsü engelleme V1'de değerlendirilebilir.

## API Güvenliği

Kurallar:

- Input validation zorunludur.
- Rate limit uygulanır.
- CORS kontrollü yapılandırılır.
- Hata mesajları sistem detaylarını açığa çıkarmaz.
- SQL injection riskine karşı ORM veya parametreli sorgu kullanılır.
- Dosya yükleme MVP kapsamına alınmaz.

Rate limit önerileri:

- Login: IP başına dakikada 5 deneme
- IOC arama: kullanıcı başına dakikada 60 istek
- AI özet: kullanıcı başına dakikada 10 istek
- Genel API: kullanıcı başına dakikada 120 istek

## AI Güvenliği

Kurallar:

- AI sağlayıcı anahtarı mobilde bulunmaz.
- AI'a sadece gerekli veri gönderilir.
- Prompt injection riskine karşı sistem talimatları backend tarafında sabitlenir.
- AI çıktısı kaynak veri yerine geçmez.
- AI uydurma bilgi üretirse kullanıcıya zarar verebilecek otomatik aksiyon alınmaz.

AI riskleri:

- Yanlış özet
- Kaynakta olmayan bilgi üretme
- Hassas verinin gereksiz paylaşımı
- Prompt manipülasyonu

Kontroller:

- Prompt versiyonlama
- Output format kısıtları
- Kullanıcıya AI çıktısı olduğunu gösterme
- Hassas veri maskeleme

## Bildirim Güvenliği

Push bildirimlerinde:

- Gereksiz hassas IOC detayı yazılmaz.
- Bildirim kısa ve genel tutulur.
- Detay görüntülemek için uygulama içinde oturum gerekir.
- Cihaz tokenları kullanıcı hesabıyla ilişkilendirilir.

Örnek güvenli bildirim:

```text
Kritik tehdit tespit edildi. Detayları görüntülemek için uygulamayı açın.
```

## Audit Log

Kaydedilecek olaylar:

- Başarılı giriş
- Başarısız giriş
- Çıkış
- IOC arama
- Tehdit detayı görüntüleme
- AI özet üretme
- Favori ekleme/silme
- Bildirim tercihi güncelleme

Audit log alanları:

- user_id
- action
- target_type
- target_id
- ip_address
- user_agent
- created_at

## Tehdit Modeli

### Risk 1 - Yetkisiz Erişim

Senaryo: Saldırgan geçerli token olmadan API verilerine erişmeye çalışır.

Kontroller:

- JWT doğrulama
- Rol kontrolü
- HTTPS
- Rate limit

### Risk 2 - Token Çalınması

Senaryo: Kullanıcının tokenı ele geçirilir.

Kontroller:

- Kısa access token süresi
- Refresh token yönetimi
- Güvenli mobil storage
- Şüpheli oturum tespiti V1

### Risk 3 - IOC Arama Abuse

Senaryo: API toplu IOC sorgusu için kötüye kullanılır.

Kontroller:

- Rate limit
- Audit log
- Anormal kullanım alarmı V1

### Risk 4 - AI Bilgi Sızdırması

Senaryo: Hassas veri gereksiz şekilde AI sağlayıcısına gönderilir.

Kontroller:

- Veri minimizasyonu
- Maskeleme
- Backend kontrollü AI çağrısı

## MVP Güvenlik Kabul Kriterleri

- Protected endpointler token olmadan çalışmaz.
- Kullanıcı parolası hashlenmiş saklanır.
- Mobil uygulama API anahtarı içermez.
- Tokenlar güvenli storage içinde tutulur.
- Kritik aksiyonlar audit loga yazılır.
- Push bildirimleri hassas detay içermez.
- AI çağrıları backend üzerinden yapılır.

