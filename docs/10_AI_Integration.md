# 10 - AI Integration

## Amaç

Bu belge, CTI-Mobile içinde AI özelliklerinin nasıl kullanılacağını tanımlar. AI katmanı; tehdit raporlarını özetlemek, teknik bilgiyi sadeleştirmek, IOC bağlamı üretmek ve kullanıcıya aksiyon önerileri sunmak için kullanılacaktır.

## Temel İlke

AI, karar verici tek kaynak değildir. AI çıktısı kullanıcıya yardımcı analiz olarak sunulur. Kritik güvenlik kararlarında kaynak veri ve analist değerlendirmesi esas alınır.

## AI Kullanım Alanları

### 1. Kısa Tehdit Özeti

Amaç: Uzun tehdit raporunu 3-5 maddelik anlaşılır özete dönüştürmek.

Kullanıcılar:

- CTI analisti
- SOC analisti
- Güvenlik yöneticisi

Çıktı örneği:

```text
- Finans sektörünü hedefleyen yüksek riskli kampanya tespit edildi.
- Domain tabanlı IOC'ler aktif olarak kullanılıyor.
- DNS ve proxy loglarının son 30 gün için kontrol edilmesi önerilir.
```

### 2. Teknik Özet

Amaç: Tehdidin teknik detaylarını IOC, TTP ve savunma aksiyonları halinde sunmak.

İçerik:

- Saldırı vektörü
- Kullanılan IOC'ler
- MITRE ATT&CK eşleşmeleri
- Önerilen savunma adımları

### 3. Yönetici Özeti

Amaç: Tehdidin iş etkisini teknik olmayan dille açıklamak.

İçerik:

- Kuruma olası etkisi
- Risk seviyesi
- Öncelikli yönetim aksiyonları
- Ekiplerin odaklanması gereken alanlar

### 4. IOC Açıklaması

Amaç: Bir IOC'nin ne anlama geldiğini ve neden riskli olabileceğini açıklamak.

İçerik:

- IOC tipi
- İlişkili tehditler
- Risk gerekçesi
- İlk önerilen kontrol adımları

### 5. Aksiyon Listesi

Amaç: Tehdit detayından uygulanabilir maddeler çıkarmak.

Örnek aksiyonlar:

- Domain engelleme listesine eklenmeli.
- DNS logları taranmalı.
- EDR üzerinde hash araması yapılmalı.
- İlgili kullanıcı hesapları kontrol edilmeli.

## Mimari Konum

AI çağrıları sadece backend üzerinden yapılır.

```text
Flutter App
→ Backend API
→ AI Module
→ AI Provider
→ Backend Response
→ Flutter UI
```

Mobil uygulama doğrudan AI sağlayıcısına bağlanmaz.

Gerekçe:

- API anahtarları mobilde saklanmaz.
- Prompt versiyonları backend tarafında yönetilir.
- Kullanıcı yetkisi backend tarafından kontrol edilir.
- AI çıktıları audit ve kalite sürecine dahil edilebilir.

## Endpointler

MVP endpoint:

```text
POST /api/v1/ai/threat-summary
```

Request:

```json
{
  "threat_id": "uuid",
  "summary_type": "short"
}
```

Response:

```json
{
  "data": {
    "id": "uuid",
    "threat_id": "uuid",
    "summary_type": "short",
    "content": "- Kritik bulgu...\n- Önerilen aksiyon...",
    "model": "configured-model",
    "created_at": "2026-07-07T10:15:00Z"
  }
}
```

## Prompt Şablonları

Promptlar backend içinde versiyonlanmalıdır.

Örnek klasör:

```text
backend/app/ai/prompts/
├── threat_summary_short_v1.txt
├── threat_summary_technical_v1.txt
├── threat_summary_executive_v1.txt
└── action_items_v1.txt
```

## Kısa Özet Prompt Kuralları

AI'dan beklenen:

- 3-5 madde üret.
- Sadece verilen tehdit verisini kullan.
- Uydurma IOC, tarih, kaynak veya aktör üretme.
- Belirsizlik varsa açıkça belirt.
- Gereksiz uzun açıklama yapma.

Örnek sistem talimatı:

```text
Sen bir siber tehdit istihbaratı asistanısın. Sadece verilen tehdit verisini kullanarak kısa, doğru ve aksiyon odaklı özet üret. Veride olmayan bilgi ekleme.
```

## Teknik Özet Prompt Kuralları

AI'dan beklenen:

- Teknik bulguları sınıflandır.
- IOC'leri ayrı listele.
- TTP bilgisi varsa belirt.
- Savunma önerilerini uygulanabilir yaz.
- Kaynakta olmayan MITRE tekniği uydurma.

## Yönetici Özeti Prompt Kuralları

AI'dan beklenen:

- Teknik jargonu azalt.
- İş etkisini açıkla.
- Öncelikli yönetim aksiyonlarını yaz.
- Kısa ve karar odaklı ol.

## AI Çıktı Kalite Kuralları

AI çıktısı:

- Kaynak veriye bağlı kalmalıdır.
- Gereksiz kesinlik iddiası taşımamalıdır.
- Bilinmeyen alanları uydurmamalıdır.
- Hassas bilgileri gereksiz tekrar etmemelidir.
- Kullanıcının rolüne uygun detay seviyesinde olmalıdır.

## Hata Yönetimi

AI çağrısı başarısız olursa:

- Tehdit detayı ekranı çalışmaya devam eder.
- Kullanıcıya kısa hata mesajı gösterilir.
- Backend hata detayını güvenli şekilde loglar.
- Gerekirse kullanıcı tekrar deneyebilir.

Kullanıcı mesajı:

```text
AI özeti şu anda oluşturulamadı. Tehdit detaylarını görüntülemeye devam edebilirsiniz.
```

## Cache Stratejisi

MVP'de üretilen AI özetleri `ai_summaries` tablosunda saklanır.

Amaç:

- Aynı tehdit için gereksiz tekrar AI çağrısı azaltılır.
- Kullanıcı daha hızlı yanıt alır.
- AI maliyeti kontrol edilir.

Cache yenileme:

- Tehdit güncellenirse yeni özet üretilebilir.
- Prompt versiyonu değişirse yeni özet üretilebilir.

## Güvenlik ve Gizlilik

- AI sağlayıcısına sadece gerekli veri gönderilir.
- Parola, token, özel kullanıcı bilgisi AI'a gönderilmez.
- Hassas kurum verisi için maskeleme uygulanabilir.
- AI çıktısı audit ve güvenlik politikalarına göre saklanır.

## MVP Kabul Kriterleri

- Backend tehdit için kısa AI özeti üretebilir.
- AI çağrısı mobil uygulama yerine backend üzerinden yapılır.
- AI çıktısı `ai_summaries` tablosuna kaydedilir.
- AI hata durumunda tehdit detayı ekranı bozulmaz.
- Prompt şablonları versiyonlanır.

