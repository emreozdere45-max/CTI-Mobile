# 08 - Database

## Amaç

Bu belge, CTI-Mobile uygulamasının veritabanı modelini tanımlar. Model; kullanıcılar, roller, tehditler, IOC kayıtları, kaynaklar, favoriler, bildirimler, AI özetleri ve audit log verilerini kapsar.

## Veritabanı Seçimi

Önerilen veritabanı: PostgreSQL

Gerekçe:

- İlişkisel veri modeli için güçlüdür.
- JSONB desteği sayesinde esnek CTI verileri saklanabilir.
- Index, constraint ve transaction desteği olgundur.
- Güvenlik ve audit gereksinimleri için uygundur.

## Genel Veri Modeli

Ana tablolar:

- users
- roles
- user_roles
- sources
- threats
- iocs
- threat_iocs
- favorites
- notifications
- user_notification_preferences
- ai_summaries
- audit_logs

## ERD Taslağı

```text
users ─── user_roles ─── roles
  │
  ├── favorites
  ├── notifications
  ├── ai_summaries
  └── audit_logs

sources ─── threats ─── threat_iocs ─── iocs
```

## Ortak Alanlar

Çoğu tabloda aşağıdaki alanlar bulunmalıdır:

- id
- created_at
- updated_at

Silme işlemlerinde MVP'de hard delete kullanılabilir. V1'de soft delete için `deleted_at` alanı eklenebilir.

## Enum Değerleri

### threat_severity

- critical
- high
- medium
- low
- info

### ioc_type

- ip
- domain
- url
- hash
- email
- file
- other

### notification_level

- critical_only
- high_and_critical
- all
- silent

### favorite_target_type

- threat
- ioc

### ai_summary_type

- short
- technical
- executive
- action_items

## Tablolar

### roles

Kullanıcı rollerini saklar.

| Alan | Tip | Açıklama |
| --- | --- | --- |
| id | UUID | Birincil anahtar |
| name | VARCHAR(64) | Rol adı |
| description | TEXT | Rol açıklaması |
| created_at | TIMESTAMP | Oluşturulma zamanı |
| updated_at | TIMESTAMP | Güncellenme zamanı |

Örnek roller:

- cti_analyst
- soc_analyst
- incident_responder
- security_manager
- ciso
- admin

### users

Uygulama kullanıcılarını saklar.

| Alan | Tip | Açıklama |
| --- | --- | --- |
| id | UUID | Birincil anahtar |
| email | VARCHAR(255) | Kullanıcı e-postası |
| password_hash | TEXT | Parola hash değeri |
| full_name | VARCHAR(255) | Ad soyad |
| status | VARCHAR(32) | active, disabled, invited |
| last_login_at | TIMESTAMP | Son giriş zamanı |
| created_at | TIMESTAMP | Oluşturulma zamanı |
| updated_at | TIMESTAMP | Güncellenme zamanı |

Index önerileri:

- unique index on users.email
- index on users.status

### user_roles

Kullanıcı ve rol ilişkisini saklar.

| Alan | Tip | Açıklama |
| --- | --- | --- |
| user_id | UUID | users.id |
| role_id | UUID | roles.id |
| created_at | TIMESTAMP | Oluşturulma zamanı |

Kısıt:

- user_id + role_id unique olmalıdır.

### sources

Tehdit istihbaratı kaynaklarını saklar.

| Alan | Tip | Açıklama |
| --- | --- | --- |
| id | UUID | Birincil anahtar |
| name | VARCHAR(255) | Kaynak adı |
| source_type | VARCHAR(64) | manual, misp, opencti, api, internal |
| trust_score | INTEGER | 0-100 arası güven skoru |
| is_active | BOOLEAN | Aktiflik durumu |
| metadata | JSONB | Kaynağa özel ek bilgiler |
| created_at | TIMESTAMP | Oluşturulma zamanı |
| updated_at | TIMESTAMP | Güncellenme zamanı |

Index önerileri:

- index on sources.source_type
- index on sources.is_active

### threats

Tehdit kayıtlarını saklar.

| Alan | Tip | Açıklama |
| --- | --- | --- |
| id | UUID | Birincil anahtar |
| source_id | UUID | sources.id |
| title | VARCHAR(500) | Tehdit başlığı |
| summary | TEXT | Kısa açıklama |
| description | TEXT | Detaylı açıklama |
| severity | VARCHAR(32) | critical, high, medium, low, info |
| confidence_score | INTEGER | 0-100 arası güven skoru |
| industry | VARCHAR(128) | Etkilenen sektör |
| region | VARCHAR(128) | Bölge/ülke bilgisi |
| tags | TEXT[] | Etiketler |
| first_seen_at | TIMESTAMP | İlk görülme zamanı |
| last_seen_at | TIMESTAMP | Son görülme zamanı |
| published_at | TIMESTAMP | Yayın zamanı |
| raw_data | JSONB | Kaynaktan gelen ham/esnek veri |
| created_at | TIMESTAMP | Oluşturulma zamanı |
| updated_at | TIMESTAMP | Güncellenme zamanı |

Index önerileri:

- index on threats.severity
- index on threats.published_at
- index on threats.source_id
- GIN index on threats.tags
- index on threats.industry

### iocs

Indicator of Compromise kayıtlarını saklar.

| Alan | Tip | Açıklama |
| --- | --- | --- |
| id | UUID | Birincil anahtar |
| type | VARCHAR(32) | ip, domain, url, hash, email |
| value | TEXT | IOC değeri |
| normalized_value | TEXT | Arama için normalize edilmiş değer |
| risk_score | INTEGER | 0-100 arası risk skoru |
| confidence_score | INTEGER | 0-100 arası güven skoru |
| first_seen_at | TIMESTAMP | İlk görülme zamanı |
| last_seen_at | TIMESTAMP | Son görülme zamanı |
| metadata | JSONB | IOC özel ek bilgiler |
| created_at | TIMESTAMP | Oluşturulma zamanı |
| updated_at | TIMESTAMP | Güncellenme zamanı |

Index önerileri:

- unique index on iocs.normalized_value + iocs.type
- index on iocs.type
- index on iocs.risk_score

### threat_iocs

Tehdit ve IOC ilişkisini saklar.

| Alan | Tip | Açıklama |
| --- | --- | --- |
| threat_id | UUID | threats.id |
| ioc_id | UUID | iocs.id |
| relationship_type | VARCHAR(64) | observed, related, attributed |
| created_at | TIMESTAMP | Oluşturulma zamanı |

Kısıt:

- threat_id + ioc_id unique olmalıdır.

### favorites

Kullanıcının favori tehdit ve IOC kayıtlarını saklar.

| Alan | Tip | Açıklama |
| --- | --- | --- |
| id | UUID | Birincil anahtar |
| user_id | UUID | users.id |
| target_type | VARCHAR(32) | threat veya ioc |
| target_id | UUID | İlgili kayıt id |
| created_at | TIMESTAMP | Oluşturulma zamanı |

Kısıt:

- user_id + target_type + target_id unique olmalıdır.

### user_notification_preferences

Kullanıcının bildirim tercihlerini saklar.

| Alan | Tip | Açıklama |
| --- | --- | --- |
| id | UUID | Birincil anahtar |
| user_id | UUID | users.id |
| notification_level | VARCHAR(32) | critical_only, high_and_critical, all, silent |
| push_enabled | BOOLEAN | Push açık/kapalı |
| email_enabled | BOOLEAN | E-posta açık/kapalı |
| created_at | TIMESTAMP | Oluşturulma zamanı |
| updated_at | TIMESTAMP | Güncellenme zamanı |

### device_tokens

Mobil push bildirimleri için cihaz tokenlarını saklar.

| Alan | Tip | Açıklama |
| --- | --- | --- |
| id | UUID | Birincil anahtar |
| user_id | UUID | users.id |
| platform | VARCHAR(32) | android veya ios |
| token | TEXT | FCM/APNs token |
| is_active | BOOLEAN | Token aktif mi |
| last_seen_at | TIMESTAMP | Son görülme zamanı |
| created_at | TIMESTAMP | Oluşturulma zamanı |
| updated_at | TIMESTAMP | Güncellenme zamanı |

### notifications

Kullanıcıya gönderilen bildirimleri saklar.

| Alan | Tip | Açıklama |
| --- | --- | --- |
| id | UUID | Birincil anahtar |
| user_id | UUID | users.id |
| title | VARCHAR(255) | Bildirim başlığı |
| body | TEXT | Bildirim metni |
| target_type | VARCHAR(32) | threat, ioc, system |
| target_id | UUID | İlgili kayıt id |
| severity | VARCHAR(32) | critical, high, medium, low, info |
| read_at | TIMESTAMP | Okunma zamanı |
| sent_at | TIMESTAMP | Gönderilme zamanı |
| created_at | TIMESTAMP | Oluşturulma zamanı |

Index önerileri:

- index on notifications.user_id
- index on notifications.read_at
- index on notifications.created_at

### ai_summaries

AI tarafından üretilen özetleri saklar.

| Alan | Tip | Açıklama |
| --- | --- | --- |
| id | UUID | Birincil anahtar |
| user_id | UUID | Özeti isteyen kullanıcı |
| threat_id | UUID | İlgili tehdit |
| summary_type | VARCHAR(32) | short, technical, executive, action_items |
| content | TEXT | AI çıktısı |
| model | VARCHAR(128) | Kullanılan model adı |
| prompt_version | VARCHAR(64) | Prompt sürümü |
| status | VARCHAR(32) | success, failed |
| error_message | TEXT | Hata durumunda kısa bilgi |
| created_at | TIMESTAMP | Oluşturulma zamanı |

Index önerileri:

- index on ai_summaries.threat_id
- index on ai_summaries.summary_type
- index on ai_summaries.created_at

### audit_logs

Güvenlik ve denetim olaylarını saklar.

| Alan | Tip | Açıklama |
| --- | --- | --- |
| id | UUID | Birincil anahtar |
| user_id | UUID | users.id veya null |
| action | VARCHAR(128) | login, ioc_search, threat_view gibi |
| target_type | VARCHAR(64) | user, threat, ioc, auth |
| target_id | UUID | İlgili kayıt id |
| ip_address | INET | İstemci IP adresi |
| user_agent | TEXT | İstemci bilgisi |
| metadata | JSONB | Ek bilgiler |
| created_at | TIMESTAMP | Oluşturulma zamanı |

Index önerileri:

- index on audit_logs.user_id
- index on audit_logs.action
- index on audit_logs.created_at

## Örnek Tehdit Kaydı

```json
{
  "title": "Yeni fidye yazılımı kampanyası finans sektörünü hedefliyor",
  "summary": "Finans kurumlarını hedefleyen yüksek riskli kampanya tespit edildi.",
  "severity": "critical",
  "confidence_score": 85,
  "industry": "finance",
  "region": "global",
  "tags": ["ransomware", "phishing", "finance"]
}
```

## Örnek IOC Kaydı

```json
{
  "type": "domain",
  "value": "malicious-example.com",
  "normalized_value": "malicious-example.com",
  "risk_score": 92,
  "confidence_score": 80
}
```

## Veri Saklama Politikası

MVP önerisi:

- Audit log: 180 gün
- Notification kayıtları: 90 gün
- AI özetleri: 90 gün
- Threat ve IOC kayıtları: aktif proje politikalarına göre süresiz veya arşivli

Not:

Gerçek kurum kullanımı için veri saklama politikası hukuk, regülasyon ve kurum güvenlik politikalarıyla birlikte belirlenmelidir.

## Güvenlik Notları

- Parola düz metin saklanmaz.
- Token ve API anahtarları veritabanında düz metin tutulmaz.
- Loglarda hassas veri maskelenir.
- AI özetlerinde gereksiz kişisel veri saklanmamalıdır.
- Audit log değiştirilemezlik gereksinimi V1'de ayrıca ele alınmalıdır.

## MVP Veritabanı Kabul Kriterleri

- Kullanıcı ve rol bilgisi saklanabilir.
- Tehdit listesi ve detayı için veri modeli hazırdır.
- IOC arama ve tehdit-IOC ilişkisi desteklenir.
- Favoriler kullanıcı bazlı tutulabilir.
- Bildirim tercihleri ve cihaz tokenları saklanabilir.
- AI özetleri tehdit ve kullanıcıyla ilişkilendirilebilir.
- Audit log temel güvenlik olaylarını kaydedebilir.

