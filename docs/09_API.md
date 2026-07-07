# 09 - API

## Amaç

Bu belge, CTI-Mobile mobil uygulaması ile backend servisleri arasındaki API sözleşmesini tanımlar. API; kimlik doğrulama, kullanıcı bilgisi, tehditler, IOC arama, AI özetleme, favoriler ve bildirimleri kapsar.

## API Yaklaşımı

MVP için REST API kullanılacaktır.

Temel özellikler:

- JSON request/response
- HTTPS
- JWT tabanlı kimlik doğrulama
- OpenAPI dokümantasyonu
- Versiyonlu endpoint yapısı

Base URL örneği:

```text
https://api.cti-mobile.example.com/api/v1
```

Local geliştirme örneği:

```text
http://localhost:8000/api/v1
```

## Ortak Headerlar

Kimlik gerektiren endpointlerde:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Ortak Yanıt Formatı

Başarılı tekil yanıt:

```json
{
  "data": {},
  "meta": {}
}
```

Başarılı liste yanıtı:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 100
  }
}
```

Hata yanıtı:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": []
  }
}
```

## HTTP Durum Kodları

| Kod | Anlam |
| --- | --- |
| 200 | Başarılı |
| 201 | Oluşturuldu |
| 400 | Geçersiz istek |
| 401 | Kimlik doğrulama gerekli |
| 403 | Yetkisiz erişim |
| 404 | Kayıt bulunamadı |
| 409 | Çakışma |
| 422 | Doğrulama hatası |
| 429 | Çok fazla istek |
| 500 | Sunucu hatası |

## Auth API

### POST /auth/login

Kullanıcı girişi yapar.

Request:

```json
{
  "email": "analyst@example.com",
  "password": "password"
}
```

Response:

```json
{
  "data": {
    "access_token": "jwt_access_token",
    "refresh_token": "jwt_refresh_token",
    "token_type": "bearer",
    "expires_in": 900,
    "user": {
      "id": "uuid",
      "email": "analyst@example.com",
      "full_name": "CTI Analyst",
      "roles": ["cti_analyst"]
    }
  }
}
```

### POST /auth/refresh

Access token yeniler.

Request:

```json
{
  "refresh_token": "jwt_refresh_token"
}
```

Response:

```json
{
  "data": {
    "access_token": "new_jwt_access_token",
    "expires_in": 900
  }
}
```

### POST /auth/logout

Kullanıcı oturumunu sonlandırır.

Response:

```json
{
  "data": {
    "success": true
  }
}
```

## User API

### GET /users/me

Oturumdaki kullanıcı profilini getirir.

Response:

```json
{
  "data": {
    "id": "uuid",
    "email": "analyst@example.com",
    "full_name": "CTI Analyst",
    "roles": ["cti_analyst"],
    "notification_level": "high_and_critical"
  }
}
```

### PATCH /users/me/preferences

Kullanıcı tercihlerini günceller.

Request:

```json
{
  "notification_level": "critical_only",
  "push_enabled": true,
  "theme": "system"
}
```

Response:

```json
{
  "data": {
    "notification_level": "critical_only",
    "push_enabled": true,
    "theme": "system"
  }
}
```

## Threat API

### GET /threats

Tehdit listesini getirir.

Query parametreleri:

| Parametre | Açıklama |
| --- | --- |
| page | Sayfa numarası |
| page_size | Sayfa boyutu |
| severity | critical, high, medium, low, info |
| source_id | Kaynak id |
| tag | Etiket |
| industry | Sektör |
| search | Başlık veya açıklama araması |
| sort | published_at_desc, severity_desc |

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Yeni fidye yazılımı kampanyası",
      "summary": "Finans kurumlarını hedefleyen kritik kampanya.",
      "severity": "critical",
      "confidence_score": 85,
      "source": {
        "id": "uuid",
        "name": "Internal CTI"
      },
      "tags": ["ransomware", "finance"],
      "published_at": "2026-07-07T10:00:00Z",
      "is_favorite": false
    }
  ],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 1
  }
}
```

### GET /threats/{threat_id}

Tehdit detayını getirir.

Response:

```json
{
  "data": {
    "id": "uuid",
    "title": "Yeni fidye yazılımı kampanyası",
    "summary": "Finans kurumlarını hedefleyen kritik kampanya.",
    "description": "Detaylı tehdit açıklaması.",
    "severity": "critical",
    "confidence_score": 85,
    "industry": "finance",
    "region": "global",
    "tags": ["ransomware", "finance"],
    "source": {
      "id": "uuid",
      "name": "Internal CTI",
      "trust_score": 90
    },
    "iocs": [
      {
        "id": "uuid",
        "type": "domain",
        "value": "malicious-example.com",
        "risk_score": 92
      }
    ],
    "recommended_actions": [
      "Domain engelleme listesine eklenmeli.",
      "Son 30 gün DNS logları taranmalı."
    ],
    "first_seen_at": "2026-07-06T08:00:00Z",
    "last_seen_at": "2026-07-07T09:30:00Z",
    "published_at": "2026-07-07T10:00:00Z",
    "is_favorite": false
  }
}
```

### GET /threats/dashboard/summary

Dashboard için özet veriyi getirir.

Response:

```json
{
  "data": {
    "counts": {
      "critical": 3,
      "high": 8,
      "medium": 14,
      "low": 21
    },
    "top_threats": [
      {
        "id": "uuid",
        "title": "Yeni fidye yazılımı kampanyası",
        "severity": "critical",
        "published_at": "2026-07-07T10:00:00Z"
      }
    ]
  }
}
```

## IOC API

### GET /iocs/search

IOC araması yapar.

Query parametreleri:

| Parametre | Açıklama |
| --- | --- |
| value | Aranacak IOC değeri |
| type | Opsiyonel IOC tipi |

Örnek:

```text
GET /iocs/search?value=malicious-example.com
```

Response:

```json
{
  "data": {
    "query": "malicious-example.com",
    "detected_type": "domain",
    "results": [
      {
        "id": "uuid",
        "type": "domain",
        "value": "malicious-example.com",
        "risk_score": 92,
        "confidence_score": 80,
        "related_threat_count": 2
      }
    ]
  }
}
```

### GET /iocs/{ioc_id}

IOC detayını getirir.

Response:

```json
{
  "data": {
    "id": "uuid",
    "type": "domain",
    "value": "malicious-example.com",
    "risk_score": 92,
    "confidence_score": 80,
    "first_seen_at": "2026-07-06T08:00:00Z",
    "last_seen_at": "2026-07-07T09:30:00Z",
    "related_threats": [
      {
        "id": "uuid",
        "title": "Yeni fidye yazılımı kampanyası",
        "severity": "critical"
      }
    ],
    "is_favorite": false
  }
}
```

## AI API

### POST /ai/threat-summary

Tehdit için AI özeti üretir.

Request:

```json
{
  "threat_id": "uuid",
  "summary_type": "short"
}
```

summary_type değerleri:

- short
- technical
- executive
- action_items

Response:

```json
{
  "data": {
    "id": "uuid",
    "threat_id": "uuid",
    "summary_type": "short",
    "content": "- Finans sektörü hedefleniyor.\n- Domain tabanlı IOC tespit edildi.\n- DNS logları kontrol edilmeli.",
    "model": "configured-model",
    "created_at": "2026-07-07T10:15:00Z"
  }
}
```

### GET /ai/threat-summary/{summary_id}

Önceden üretilmiş AI özetini getirir.

Response:

```json
{
  "data": {
    "id": "uuid",
    "threat_id": "uuid",
    "summary_type": "short",
    "content": "Özet içeriği",
    "created_at": "2026-07-07T10:15:00Z"
  }
}
```

## Favorites API

### GET /favorites

Kullanıcının favorilerini listeler.

Query parametreleri:

| Parametre | Açıklama |
| --- | --- |
| target_type | threat veya ioc |

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "target_type": "threat",
      "target": {
        "id": "uuid",
        "title": "Yeni fidye yazılımı kampanyası",
        "severity": "critical"
      },
      "created_at": "2026-07-07T10:20:00Z"
    }
  ]
}
```

### POST /favorites

Favori ekler.

Request:

```json
{
  "target_type": "threat",
  "target_id": "uuid"
}
```

Response:

```json
{
  "data": {
    "id": "uuid",
    "target_type": "threat",
    "target_id": "uuid",
    "created_at": "2026-07-07T10:20:00Z"
  }
}
```

### DELETE /favorites/{favorite_id}

Favoriyi siler.

Response:

```json
{
  "data": {
    "success": true
  }
}
```

## Notification API

### POST /notifications/device-token

Cihaz push tokenını kaydeder.

Request:

```json
{
  "platform": "android",
  "token": "fcm_device_token"
}
```

Response:

```json
{
  "data": {
    "success": true
  }
}
```

### GET /notifications

Kullanıcı bildirimlerini listeler.

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Kritik tehdit tespit edildi",
      "body": "Yeni fidye yazılımı kampanyası finans sektörünü hedefliyor.",
      "target_type": "threat",
      "target_id": "uuid",
      "severity": "critical",
      "read_at": null,
      "created_at": "2026-07-07T10:30:00Z"
    }
  ]
}
```

### PATCH /notifications/{notification_id}/read

Bildirim okundu olarak işaretlenir.

Response:

```json
{
  "data": {
    "success": true
  }
}
```

## Audit API

Audit API MVP'de sadece backend iç kullanım için tasarlanır. Mobil uygulama doğrudan audit log oluşturmaz; backend önemli aksiyonları kendisi kaydeder.

V1 yönetici endpointleri:

- GET /audit-logs
- GET /audit-logs/{audit_log_id}

## Rate Limit Önerisi

MVP önerileri:

- Login: IP başına dakikada 5 deneme
- IOC arama: kullanıcı başına dakikada 60 istek
- AI özet: kullanıcı başına dakikada 10 istek
- Tehdit listeleme: kullanıcı başına dakikada 120 istek

## Güvenlik Kuralları

- Mobil uygulama AI sağlayıcısına doğrudan bağlanmaz.
- Tüm protected endpointler token doğrular.
- Kullanıcının rolü backend tarafında kontrol edilir.
- Hata mesajları hassas teknik detay içermez.
- Request ve response loglarında token, parola ve gizli veri maskelenir.

## MVP API Kabul Kriterleri

- Kullanıcı giriş yapabilir ve token alabilir.
- Kullanıcı profilini alabilir.
- Mobil uygulama dashboard özetini çekebilir.
- Tehdit listesi ve detayı alınabilir.
- IOC arama ve IOC detayı çalışır.
- AI kısa özet endpointi kullanılabilir.
- Favori ekleme, listeleme ve silme çalışır.
- Cihaz push tokenı kaydedilebilir.
- API hata yanıtları tutarlı formatta döner.

