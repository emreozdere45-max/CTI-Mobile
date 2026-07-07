# 12 - Notifications

## Amaç

Bu belge, CTI-Mobile uygulamasındaki bildirim sistemini tanımlar. Bildirimler; kritik tehditleri, takip edilen tehdit güncellemelerini ve sistem mesajlarını kullanıcıya zamanında ulaştırmak için kullanılır.

## Bildirim Yaklaşımı

Bildirimler aksiyon odaklı olmalıdır. Kullanıcıyı gereksiz yormamalı, sadece gerçekten önemli durumlarda dikkat çekmelidir.

Temel prensipler:

- Kritik bilgi hızlı ulaşmalı.
- Hassas detay bildirim içinde gösterilmemeli.
- Kullanıcı bildirim seviyesini kontrol edebilmeli.
- Bildirime dokununca ilgili uygulama ekranı açılmalı.

## Bildirim Kanalları

MVP:

- Push notification

V1:

- E-posta bildirimi
- Haftalık özet bildirimi
- Yönetici rapor bildirimi

## Teknoloji

Mobil push için:

- Android: Firebase Cloud Messaging
- iOS: Apple Push Notification service üzerinden Firebase entegrasyonu

Backend:

- Cihaz tokenlarını saklar.
- Kullanıcı tercihlerini kontrol eder.
- Bildirim içeriğini üretir.
- Push sağlayıcısına gönderim yapar.

## Bildirim Türleri

### 1. Kritik Tehdit Bildirimi

Ne zaman gönderilir:

- Yeni critical seviye tehdit eklendiğinde
- Var olan tehdit critical seviyeye yükseldiğinde

Örnek:

```text
Kritik tehdit tespit edildi. Detayları görüntülemek için uygulamayı açın.
```

Hedef ekran:

```text
Threat Detail
```

### 2. Yüksek Risk Bildirimi

Ne zaman gönderilir:

- Kullanıcının tercihi high_and_critical veya all ise
- Yeni high seviye tehdit eklendiğinde

Örnek:

```text
Yüksek riskli tehdit güncellendi.
```

### 3. Takip Edilen Tehdit Güncellemesi

Ne zaman gönderilir:

- Kullanıcının favori/takip ettiği tehdit güncellendiğinde

Örnek:

```text
Takip ettiğiniz tehdit güncellendi.
```

### 4. AI Özet Hazır Bildirimi

MVP'de zorunlu değildir. V1 için değerlendirilebilir.

Ne zaman gönderilir:

- Uzun süren AI özet görevi tamamlandığında

### 5. Sistem Bildirimi

Ne zaman gönderilir:

- Bakım
- Güvenlik duyurusu
- Uygulama politikası güncellemesi

## Kullanıcı Bildirim Tercihleri

Desteklenen seviyeler:

- critical_only
- high_and_critical
- all
- silent

Açıklama:

| Seviye | Davranış |
| --- | --- |
| critical_only | Sadece critical tehdit bildirimi |
| high_and_critical | Critical ve high bildirimleri |
| all | Tüm tehdit güncellemeleri |
| silent | Push gönderilmez |

## Cihaz Token Yönetimi

Mobil uygulama:

- Push izni ister.
- Cihaz tokenını alır.
- Backend'e gönderir.
- Token yenilenirse backend'i günceller.

Endpoint:

```text
POST /api/v1/notifications/device-token
```

Request:

```json
{
  "platform": "android",
  "token": "fcm_device_token"
}
```

Backend:

- Tokenı kullanıcıyla ilişkilendirir.
- Eski tokenları pasif yapabilir.
- Gönderim hatasında tokenı pasif hale getirebilir.

## Bildirim Karar Akışı

```text
Yeni tehdit veya güncelleme
→ Tehdit seviyesi kontrol edilir
→ Hedef kullanıcılar belirlenir
→ Kullanıcı bildirim tercihleri kontrol edilir
→ Aktif cihaz tokenları alınır
→ Push bildirimi gönderilir
→ Sonuç loglanır
```

## Deep Link Davranışı

Bildirim payload içinde hedef ekran bilgisi bulunur.

Örnek payload:

```json
{
  "type": "threat",
  "target_id": "uuid",
  "severity": "critical"
}
```

Mobil davranış:

- Kullanıcı oturum açıksa doğrudan ilgili detaya gider.
- Oturum yoksa önce giriş ekranı açılır.
- Giriş sonrası hedef detay ekranına yönlendirme yapılır.

## Güvenlik Kuralları

Bildirim içinde:

- Parola, token veya gizli veri bulunmaz.
- Uzun IOC listesi gösterilmez.
- Hassas kurum adı gereksiz yazılmaz.
- Detay için uygulama içi kimlik doğrulama gerekir.

Güvenli bildirim örneği:

```text
Kritik tehdit tespit edildi. Detayları görüntülemek için uygulamayı açın.
```

Güvensiz bildirim örneği:

```text
malicious-example.com domaini kurum ağına sızdı.
```

## Bildirim Veritabanı

İlgili tablolar:

- user_notification_preferences
- device_tokens
- notifications

`notifications` tablosu kullanıcıya gönderilen bildirimin uygulama içinde de gösterilmesini sağlar.

## Hata Yönetimi

Gönderim başarısız olursa:

- Hata güvenli şekilde loglanır.
- Token geçersizse pasif yapılır.
- Kritik bildirimlerde retry mekanizması V1'de eklenir.

## Bildirim Ekranı

MVP'de ayrı bildirim merkezi opsiyoneldir.

V1 önerisi:

- Okunmamış bildirim listesi
- Okundu olarak işaretleme
- Bildirime dokununca ilgili detaya gitme
- Kritik bildirim filtresi

## MVP Kabul Kriterleri

- Mobil uygulama cihaz tokenını backend'e gönderebilir.
- Kullanıcı bildirim seviyesini seçebilir.
- Critical tehdit için push bildirimi gönderilebilir.
- Bildirime dokununca Tehdit Detayı açılır.
- Silent tercihinde push gönderilmez.
- Bildirim içeriği hassas detay içermez.

