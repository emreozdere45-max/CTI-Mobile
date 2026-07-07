# 07 - Architecture

## Amaç

Bu belge, CTI-Mobile uygulamasının teknik mimarisini tanımlar. Hedef; mobil uygulama, backend API, veritabanı, AI katmanı, bildirim servisi ve dış tehdit istihbaratı kaynaklarının nasıl birlikte çalışacağını netleştirmektir.

## Mimari Yaklaşım

CTI-Mobile, MVP aşamasında sade ama büyümeye uygun bir istemci-sunucu mimarisiyle tasarlanır.

Ana parçalar:

- Flutter mobil uygulama
- Backend API
- Veritabanı
- AI özetleme servisi
- Bildirim servisi
- Tehdit istihbaratı veri kaynakları
- Yönetim ve audit katmanı

## Yüksek Seviye Sistem Görünümü

```text
┌────────────────────┐
│ Flutter Mobile App │
└─────────┬──────────┘
          │ HTTPS / JSON
          ▼
┌────────────────────┐
│ Backend API        │
│ Auth, Threat, IOC  │
└──────┬───────┬─────┘
       │       │
       │       ▼
       │  ┌─────────────────┐
       │  │ AI Service      │
       │  │ Summary/Explain │
       │  └─────────────────┘
       │
       ▼
┌────────────────────┐
│ Database           │
│ Users, Threats, IOC│
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ CTI Sources        │
│ MISP/OpenCTI/API   │
└────────────────────┘

┌────────────────────┐
│ Push Notification  │
│ FCM/APNs           │
└────────────────────┘
```

## Önerilen Teknoloji Seçimleri

### Mobil

Öneri: Flutter

Gerekçe:

- Tek kod tabanıyla Android ve iOS üretilebilir.
- Güçlü UI geliştirme deneyimi sunar.
- Offline cache, push notification ve güvenli storage desteği olgunlaşmıştır.

Önerilen mobil paketler:

- State management: Riverpod veya Bloc
- Network: Dio
- Secure storage: flutter_secure_storage
- Local cache: Hive, Drift veya SQLite
- Push: Firebase Cloud Messaging

### Backend

Öneri: Node.js/NestJS veya Python/FastAPI

MVP için iki seçenek:

1. NestJS
   - Kurumsal yapı, modüler mimari ve TypeScript avantajı.
   - Büyük API projelerinde düzenli klasör yapısı sağlar.

2. FastAPI
   - Hızlı geliştirme, güçlü veri doğrulama ve AI servisleriyle rahat entegrasyon.
   - Python ekosistemi AI/ML işleri için avantajlıdır.

Bu proje için önerilen başlangıç: FastAPI.

Gerekçe:

- AI entegrasyonu daha doğal ilerler.
- Pydantic ile API veri modelleri net yazılır.
- MVP hızlı ayağa kaldırılır.

### Veritabanı

Öneri: PostgreSQL

Gerekçe:

- İlişkisel veri modeli için güçlüdür.
- Tehdit, IOC, kullanıcı, favori ve audit log gibi veriler net modellenebilir.
- JSONB alanları sayesinde esnek tehdit verileri tutulabilir.

### Cache / Queue

MVP'de zorunlu değildir, V1'de eklenebilir.

V1 önerisi:

- Redis: Cache, rate limit ve kısa süreli görev durumu
- Queue: Celery, RQ veya BullMQ

### AI Katmanı

AI katmanı backend üzerinden çağrılmalıdır. Mobil uygulama doğrudan AI sağlayıcısına bağlanmamalıdır.

Gerekçe:

- API anahtarları mobil uygulamada saklanmaz.
- Prompt ve güvenlik kontrolleri backend tarafında yönetilir.
- AI çıktıları audit ve kalite kontrol süreçlerine dahil edilebilir.

## Backend Modülleri

MVP backend aşağıdaki modüllerden oluşur:

```text
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── logging.py
│   ├── auth/
│   ├── users/
│   ├── threats/
│   ├── iocs/
│   ├── ai/
│   ├── notifications/
│   ├── favorites/
│   └── audit/
└── tests/
```

### Auth Modülü

Sorumluluklar:

- Kullanıcı girişi
- Token üretimi
- Token doğrulama
- Rol kontrolü

### Users Modülü

Sorumluluklar:

- Kullanıcı profili
- Rol bilgisi
- Bildirim tercihleri

### Threats Modülü

Sorumluluklar:

- Tehdit listeleme
- Tehdit detayı
- Filtreleme
- Risk seviyesi hesaplama veya saklama

### IOC Modülü

Sorumluluklar:

- IOC arama
- IOC tip algılama
- IOC detayı
- İlişkili tehditleri getirme

### AI Modülü

Sorumluluklar:

- Kısa tehdit özeti
- Teknik özet
- Yönetici özeti
- Prompt şablonları
- AI hata yönetimi

### Notifications Modülü

Sorumluluklar:

- Push token kaydı
- Kritik tehdit bildirimi
- Bildirim tercihleri

### Favorites Modülü

Sorumluluklar:

- Tehdit favorileri
- IOC favorileri
- Favori listeleme

### Audit Modülü

Sorumluluklar:

- Giriş olayları
- IOC aramaları
- Tehdit detay görüntüleme
- Yönetim işlemleri

## Mobil Uygulama Katmanları

Flutter uygulama aşağıdaki katmanlarla geliştirilebilir:

```text
mobile/
├── lib/
│   ├── main.dart
│   ├── app/
│   ├── core/
│   │   ├── network/
│   │   ├── storage/
│   │   ├── theme/
│   │   └── routing/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── threats/
│   │   ├── iocs/
│   │   ├── favorites/
│   │   └── settings/
│   └── shared/
│       ├── widgets/
│       └── models/
└── test/
```

### Presentation Layer

Ekranlar, widget'lar ve kullanıcı etkileşimleri burada yer alır.

### Application Layer

State management, use case ve ekran davranışları burada yönetilir.

### Data Layer

API client, local cache ve veri modelleri burada bulunur.

## Veri Akışı

### Tehdit Listesi Akışı

```text
Mobile Threats Screen
→ Backend GET /threats
→ Database threats table
→ Backend response
→ Mobile state update
→ UI render
```

### IOC Arama Akışı

```text
Mobile IOC Search
→ Backend GET /iocs/search?value=...
→ IOC type detection
→ Database lookup
→ Related threat lookup
→ Backend response
→ Mobile IOC Detail
```

### AI Özet Akışı

```text
Mobile Threat Detail
→ Backend POST /ai/threat-summary
→ Backend validates user and threat access
→ AI provider call
→ AI response normalization
→ Backend returns summary
→ Mobile displays AI summary
```

### Bildirim Akışı

```text
Threat created or updated
→ Backend evaluates severity
→ User notification preferences checked
→ Push notification sent via FCM/APNs
→ User taps notification
→ Mobile opens Threat Detail
```

## Güvenlik Mimarisi

Temel prensipler:

- Tüm trafik HTTPS üzerinden yapılır.
- Mobil uygulamada API anahtarı saklanmaz.
- Kullanıcı token'ları güvenli storage içinde tutulur.
- Backend tüm yetki kontrollerini tekrar yapar.
- AI sağlayıcı anahtarları sadece backend ortam değişkenlerinde bulunur.
- Loglarda parola, token, API anahtarı veya hassas IOC açıklamaları tutulmaz.

## Kimlik Doğrulama

MVP yaklaşımı:

- E-posta/parola ile giriş
- JWT access token
- Refresh token
- Rol bilgisi token veya kullanıcı profilinden alınır

V1 yaklaşımı:

- SSO entegrasyonu
- MFA desteği
- Kurumsal kimlik sağlayıcı bağlantısı

## API İletişimi

Mobil ve backend JSON tabanlı REST API ile haberleşir.

MVP endpoint grupları:

- `/auth`
- `/users`
- `/threats`
- `/iocs`
- `/ai`
- `/favorites`
- `/notifications`

REST seçilme nedeni:

- MVP için hızlı ve anlaşılırdır.
- Mobil uygulama tarafında kullanımı kolaydır.
- Dokümantasyonu OpenAPI ile otomatik üretilebilir.

## Veritabanı Genel Modeli

Ana tablolar:

- users
- roles
- threats
- iocs
- threat_iocs
- sources
- favorites
- notifications
- audit_logs
- ai_summaries

Detaylı veri modeli `08_Database.md` içinde tanımlanacaktır.

## AI Entegrasyonu

AI entegrasyonu backend içindeki `ai` modülü üzerinden yönetilir.

AI görevleri:

- Kısa tehdit özeti
- Teknik özet
- Yönetici özeti
- IOC açıklaması
- Önerilen aksiyon listesi

AI çıktı ilkeleri:

- Kaynak veri dışına taşmamalı
- Belirsizlik varsa açık belirtmeli
- Uydurma IOC, kaynak veya tarih üretmemeli
- Teknik doğruluğu korumalı
- Kullanıcı rolüne göre ton ve detay seviyesi ayarlanmalı

Detaylı AI tasarımı `10_AI_Integration.md` içinde yazılacaktır.

## Dış Kaynak Entegrasyonları

MVP'de veri manuel veya seed veriyle başlatılabilir.

V1 ve sonrası:

- MISP
- OpenCTI
- VirusTotal benzeri IOC zenginleştirme kaynakları
- Kurum içi SIEM
- EDR/XDR kaynakları

Not:

Gerçek CTI kaynakları lisans, gizlilik ve rate limit kontrolleri nedeniyle ayrı güvenlik değerlendirmesi gerektirir.

## Deployment Mimarisi

MVP için önerilen ortamlar:

- Local development
- Staging
- Production

Backend deployment seçenekleri:

- Docker container
- Cloud VM
- Managed container service

Veritabanı:

- Managed PostgreSQL önerilir.

Mobil dağıtım:

- Android internal testing
- iOS TestFlight
- Sonrasında store yayınları

Detaylı deployment planı `15_Deployment.md` içinde yazılacaktır.

## Ölçeklenebilirlik

MVP sade tutulur. V1'de aşağıdaki iyileştirmeler yapılabilir:

- Redis cache
- Arka plan job queue
- Threat ingestion worker
- AI summary cache
- Rate limiting
- Observability dashboard

## Gözlemlenebilirlik

Backend aşağıdaki olayları izlemelidir:

- API hata oranları
- Endpoint yanıt süreleri
- Başarısız giriş denemeleri
- IOC arama hacmi
- AI çağrı başarı/hata oranı
- Push bildirim başarı oranı

## Mimari Kararlar

### ADR-001 - Mobilde Flutter Kullanımı

Karar: Mobil uygulama Flutter ile geliştirilecek.

Neden: Tek kod tabanı, hızlı UI geliştirme, Android/iOS desteği.

### ADR-002 - Backend Başlangıcı FastAPI

Karar: Backend MVP için FastAPI önerilir.

Neden: Hızlı geliştirme, OpenAPI desteği, AI entegrasyonuna uygun Python ekosistemi.

### ADR-003 - PostgreSQL Kullanımı

Karar: Ana veritabanı PostgreSQL olacak.

Neden: İlişkisel veri, JSONB esnekliği ve olgun güvenilirlik.

### ADR-004 - AI Çağrıları Backend Üzerinden

Karar: Mobil uygulama AI sağlayıcısına doğrudan bağlanmayacak.

Neden: Güvenlik, anahtar yönetimi, prompt kontrolü ve audit ihtiyacı.

## MVP Mimari Kabul Kriterleri

- Mobil uygulama backend API üzerinden giriş yapabilir.
- Mobil uygulama tehdit listesini API'den alabilir.
- Mobil uygulama IOC arama endpointini kullanabilir.
- Backend PostgreSQL ile temel tehdit ve IOC verisini saklayabilir.
- Backend AI özet endpointi sağlayabilir.
- Push bildirim için cihaz token'ı kaydedilebilir.
- Backend temel audit log üretebilir.

## Sonraki Adımlar

1. `08_Database.md` içinde tablo yapıları yazılacak.
2. `09_API.md` içinde endpoint sözleşmeleri tanımlanacak.
3. `10_AI_Integration.md` içinde prompt ve çıktı kuralları netleştirilecek.
4. `11_Security.md` içinde tehdit modeli ve güvenlik kontrolleri yazılacak.
5. Backend ve mobil klasörleri bu mimariye göre kodlanmaya başlanacak.

