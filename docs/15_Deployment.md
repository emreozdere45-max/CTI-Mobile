# 15 - Deployment

## Amaç

Bu belge, CTI-Mobile uygulamasının geliştirme ortamından yayına kadar nasıl hazırlanacağını tanımlar. Deployment planı backend API, veritabanı, mobil uygulama, ortam değişkenleri, CI/CD ve yayın sonrası izlemeyi kapsar.

## Ortamlar

### Local Development

Geliştiricinin kendi bilgisayarında çalışır.

İçerik:

- Flutter mobil uygulama
- FastAPI backend
- Local PostgreSQL veya Docker PostgreSQL
- Seed test verisi
- Mock veya test AI sağlayıcı ayarı

### Staging

Production öncesi test ortamıdır.

Amaç:

- API ve mobil uygulama entegrasyonunu doğrulamak
- Test kullanıcılarıyla gerçekçi kullanım yapmak
- Push notification ve AI entegrasyonunu kontrollü denemek

### Production

Gerçek kullanıcıların kullandığı canlı ortamdır.

Gereksinimler:

- HTTPS
- Güvenli secret yönetimi
- Yedekleme
- Monitoring
- Error tracking
- Rate limit

## Backend Deployment

Önerilen yaklaşım:

- Backend Docker container olarak paketlenir.
- PostgreSQL managed servis olarak kullanılır.
- Ortam değişkenleri secret manager veya güvenli environment üzerinden verilir.

Örnek backend bileşenleri:

```text
Backend API Container
PostgreSQL Database
Redis optional
Object storage optional
Monitoring
Logging
```

## Mobil Deployment

Android:

- Internal testing
- Closed testing
- Production release

iOS:

- TestFlight
- App Store review
- Production release

MVP'de önce Android internal testing ile başlanabilir.

## Ortam Değişkenleri

Backend için örnek değişkenler:

```text
APP_ENV=local
APP_SECRET_KEY=change-me
DATABASE_URL=postgresql://user:pass@localhost:5432/cti_mobile
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
AI_PROVIDER_API_KEY=change-me
FCM_SERVER_KEY=change-me
LOG_LEVEL=INFO
```

Mobil için build-time ayarlar:

```text
API_BASE_URL=https://api.cti-mobile.example.com/api/v1
APP_ENV=staging
```

Güvenlik notu:

- Gerçek secret değerleri GitHub'a eklenmez.
- `.env` dosyası repo dışında tutulur veya örnek olarak `.env.example` sağlanır.

## CI/CD Planı

Önerilen araç:

- GitHub Actions

### Pull Request Pipeline

Her pull request için:

1. Backend dependency install
2. Backend lint
3. Backend test
4. Mobile dependency install
5. Mobile format check
6. Mobile test
7. Security dependency scan

### Main Branch Pipeline

Main branch'e merge sonrası:

1. Tüm testler çalışır.
2. Backend Docker image build edilir.
3. Image registry'ye gönderilir.
4. Staging ortamına deploy edilir.
5. Smoke test çalışır.

### Production Pipeline

Production release manuel onayla yapılmalıdır.

Adımlar:

1. Release tag oluşturulur.
2. Backend production image seçilir.
3. Database migration çalışır.
4. Backend deploy edilir.
5. Smoke test yapılır.
6. Mobil release store süreçlerine gönderilir.

## Database Migration

Migration aracı:

- Alembic

Kurallar:

- Her schema değişikliği migration dosyasıyla yapılır.
- Production migration öncesi backup alınır.
- Geri dönüş planı yazılır.
- Büyük migrationlar parçalara bölünür.

## Seed Veri

Local ve staging için seed veri kullanılabilir.

Seed içerikleri:

- Demo kullanıcılar
- Roller
- Kaynaklar
- Örnek tehditler
- Örnek IOC'ler

Production ortamında demo seed veri kullanılmaz.

## Monitoring

Backend izlenecek metrikler:

- API response time
- Error rate
- Login failure count
- IOC search count
- AI request count
- AI error rate
- Push notification success/failure

Mobil izlenecek metrikler:

- Crash rate
- App start time
- API error screens
- Push open rate

## Logging

Log kuralları:

- Token loglanmaz.
- Parola loglanmaz.
- API anahtarı loglanmaz.
- Hassas payload alanları maskelenir.
- Error logları izlenebilir ama güvenli olmalıdır.

## Backup ve Recovery

PostgreSQL için:

- Günlük otomatik backup
- Kritik release öncesi manuel backup
- Backup restore testi

Recovery hedefleri MVP için:

- RPO: 24 saat
- RTO: 4 saat

Bu değerler gerçek kurum gereksinimlerine göre sıkılaştırılabilir.

## Release Checklist

Backend release öncesi:

- Testler geçti.
- Migration dosyaları kontrol edildi.
- Environment değişkenleri doğrulandı.
- Security checklist tamamlandı.
- Staging smoke test başarılı.

Mobil release öncesi:

- API base URL doğru.
- App version güncellendi.
- Push notification test edildi.
- Login ve temel akışlar test edildi.
- Store metadata hazırlandı.

## Rollback Planı

Backend rollback:

- Önceki Docker image'a dön.
- Gerekirse migration rollback çalıştır.
- Hata loglarını kontrol et.
- Kullanıcı etkisini raporla.

Mobil rollback:

- Store süreçleri nedeniyle anlık rollback sınırlıdır.
- Kritik hata varsa yeni hotfix release hazırlanır.
- Remote config V1'de kullanılabilir.

## MVP Deployment Kabul Kriterleri

- Backend Docker ile çalıştırılabilir.
- Local ortam tek komutla ayağa kalkabilir.
- Staging ortamı production öncesi test için hazırdır.
- Database migration süreci tanımlıdır.
- Environment secretları repo dışında tutulur.
- Backend health check endpointi vardır.
- Release checklist uygulanır.

## Sonraki Adımlar

1. Backend için Dockerfile hazırlanacak.
2. Docker Compose ile local PostgreSQL eklenecek.
3. Alembic migration yapısı kurulacak.
4. GitHub Actions pipeline yazılacak.
5. Flutter build flavor yapısı hazırlanacak.

