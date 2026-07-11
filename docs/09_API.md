# 09 - API

Bu belge, CTI-Mobile mobil uygulamasinin backend ile nasil konusacagini anlatir. Swagger'da gordugumuz endpointlerin kisa sozlesmesidir.

Local base URL:

```text
http://127.0.0.1:8000/api/v1
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

## Kimlik Dogrulama

Protected endpointlerde JWT token gerekir.

Header:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Swagger'daki `Authorize` kutusuna sadece token degeri girilir. `Bearer` yazilmaz.

## Calisan MVP Endpointleri

| Endpoint | Method | Amac | Token |
| --- | --- | --- | --- |
| `/health` | GET | Root health kontrolu | Hayir |
| `/api/v1/health` | GET | API v1 health kontrolu | Hayir |
| `/api/v1/auth/login` | POST | Kullanici login eder, access token verir | Hayir |
| `/api/v1/users/me` | GET | Giris yapan kullaniciyi getirir | Evet |
| `/api/v1/threats` | GET | Tehdit listesini getirir | Evet |
| `/api/v1/threats/{threat_id}` | GET | Tek tehdit detayini getirir | Evet |
| `/api/v1/iocs/search` | GET | Domain/IP gibi IOC arar | Evet |
| `/api/v1/ai/threat-summary` | POST | Tehdit icin mock AI ozeti uretir | Evet |
| `/api/v1/favorites` | POST | Threat veya IOC favoriye ekler | Evet |
| `/api/v1/favorites` | GET | Favorileri listeler | Evet |
| `/api/v1/favorites/{favorite_id}` | DELETE | Favoriyi siler | Evet |
| `/api/v1/notifications` | GET | Bildirimleri listeler | Evet |
| `/api/v1/notifications/{notification_id}/read` | PATCH | Bir bildirimi okundu yapar | Evet |
| `/api/v1/notifications/read-all` | PATCH | Tum bildirimleri okundu yapar | Evet |

## Auth

### POST /api/v1/auth/login

Kullanici girisi yapar.

Request:

```json
{
  "email": "analyst@example.com",
  "password": "ChangeMe123!"
}
```

Response:

```json
{
  "data": {
    "access_token": "jwt_access_token",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "analyst@example.com",
      "full_name": "Demo CTI Analyst",
      "roles": ["cti_analyst"]
    }
  }
}
```

Mobil uygulama bu tokeni saklar ve sonraki isteklerde kullanir.

## Users

### GET /api/v1/users/me

Giris yapan kullanicinin profilini getirir.

Response:

```json
{
  "data": {
    "id": "uuid",
    "email": "analyst@example.com",
    "full_name": "Demo CTI Analyst",
    "roles": ["cti_analyst"],
    "status": "active"
  }
}
```

## Threats

### GET /api/v1/threats

Tehdit listesini getirir.

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Yeni fidye yazilimi kampanyasi finans sektorunu hedefliyor",
      "summary": "Finans kurumlarini hedefleyen yuksek riskli kampanya tespit edildi.",
      "severity": "critical",
      "confidence_score": 85,
      "source": {
        "id": "uuid",
        "name": "Internal CTI"
      },
      "tags": ["ransomware", "finance", "phishing"],
      "published_at": "2026-07-07T10:00:00Z",
      "is_favorite": false
    }
  ],
  "meta": {
    "total": 2
  }
}
```

### GET /api/v1/threats/{threat_id}

Tek tehdit detayini getirir.

Mobilde threat detail ekranini besler.

## IOCs

### GET /api/v1/iocs/search

IOC aramasi yapar.

Query:

```text
value=malicious-example.com
type=domain
```

`type` opsiyoneldir.

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
        "related_threat_count": 1
      }
    ]
  }
}
```

## AI

### POST /api/v1/ai/threat-summary

Tehdit icin AI destekli ozet uretir. MVP'de mock sonuc uretir ve `ai_summaries` tablosuna kaydeder.

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
    "content": "- Critical seviyesinde tehdit olarak onceliklendirilmeli.",
    "model": "mock-ai-v1",
    "created_at": "2026-07-11T09:00:00Z"
  }
}
```

## Favorites

### POST /api/v1/favorites

Threat veya IOC favoriye ekler.

Request:

```json
{
  "target_type": "threat",
  "target_id": "uuid"
}
```

`target_type` degerleri:

- `threat`
- `ioc`

### GET /api/v1/favorites

Kullanicinin favorilerini listeler.

Opsiyonel query:

```text
target_type=threat
```

### DELETE /api/v1/favorites/{favorite_id}

Favoriyi siler.

Onemli: Buraya `target_id` degil, `GET /favorites` response icindeki favori kaydinin kendi `id` degeri yazilir.

Response:

```json
{
  "data": {
    "success": true
  }
}
```

## Notifications

### GET /api/v1/notifications

Kullanicinin bildirimlerini listeler.

Query:

```text
unread_only=false
notification_type=critical_threat
```

`notification_type` opsiyoneldir.

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "notification_type": "critical_threat",
      "title": "Kritik tehdit tespit edildi",
      "message": "Finans sektorunu hedefleyen yeni fidye yazilimi kampanyasi incelenmeli.",
      "severity": "critical",
      "target_type": "threat",
      "target_id": "uuid",
      "is_read": false,
      "read_at": null,
      "created_at": "2026-07-11T09:37:19Z"
    }
  ],
  "meta": {
    "total": 2,
    "unread_count": 2
  }
}
```

### PATCH /api/v1/notifications/{notification_id}/read

Tek bildirimi okundu yapar.

Response icinde `is_read: true` ve `read_at` tarihi gelir.

### PATCH /api/v1/notifications/read-all

Tum okunmamis bildirimleri okundu yapar.

Response:

```json
{
  "data": {
    "updated_count": 2
  }
}
```

## HTTP Durum Kodlari

| Kod | Anlam |
| --- | --- |
| 200 | Basarili |
| 400 | Gecersiz istek |
| 401 | Login/token gerekli veya token hatali |
| 404 | Kayit bulunamadi |
| 422 | Request formatinda dogrulama hatasi |
| 500 | Sunucu hatasi |

## Sonraki API Isleri

- Refresh token endpointi
- Logout endpointi
- Device push token endpointi
- Threat dashboard summary endpointi
- Gercek AI provider entegrasyonu
- Pagination ve filtreleme gelistirmeleri
