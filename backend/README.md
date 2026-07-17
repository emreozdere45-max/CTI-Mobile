# CTI-Mobile Backend

FastAPI tabanli CTI-Mobile backend servisidir. Mobil uygulama; login, tehdit listesi, IOC arama, AI ozet, favoriler ve bildirimler icin bu API'yi kullanir.

## Ne Ise Yarar?

Backend, mobil uygulamanin guvenli veri katmanidir.

- Kullaniciyi login eder ve JWT token uretir.
- CTI tehditlerini ve IOC kayitlarini PostgreSQL'den okur.
- AI tehdit ozeti uretir ve kaydeder.
- Favorileri ve bildirimleri kullanici bazli tutar.
- Swagger ile API test ekrani sunar.

## Gereksinimler

- Python 3.11
- Docker Desktop
- PostgreSQL container'i
- Git

Windows'ta `python` komutu bulunmazsa proje icindeki sanal ortam Python'unu kullan:

```powershell
.\.venv\Scripts\python.exe
```

## Ilk Kurulum

Backend klasorune gec:

```powershell
cd "C:\Users\Lenovo\Documents\Codex\2026-07-07\s-per-bence-art-k-bu\outputs\CTI-Mobile\backend"
```

Sanal ortam yoksa olustur:

```powershell
python -m venv .venv
```

Bu komut proje icin ayri bir Python alani acar. Boylece paketler bilgisayarindaki diger Python projelerini etkilemez.

Paketleri kur:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Bu komut FastAPI, SQLAlchemy, Alembic, PostgreSQL surucusu ve auth paketlerini kurar.

## PostgreSQL'i Baslatma

Proje kok klasorune gec:

```powershell
cd "C:\Users\Lenovo\Documents\Codex\2026-07-07\s-per-bence-art-k-bu\outputs\CTI-Mobile"
```

PostgreSQL container'ini baslat:

```powershell
docker compose up -d postgres
```

Bu komut Docker icinde PostgreSQL veritabanini calistirir.

## Veritabani Tablolarini Olusturma

Backend klasorune gec:

```powershell
cd "C:\Users\Lenovo\Documents\Codex\2026-07-07\s-per-bence-art-k-bu\outputs\CTI-Mobile\backend"
```

Migration calistir:

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
```

Bu komut PostgreSQL icinde gerekli tablolari olusturur.

## Demo Verileri Ekleme

```powershell
.\.venv\Scripts\python.exe -m app.db.seed
```

Bu komut demo source, threat, IOC, user, role ve notification kayitlarini ekler.

Demo kullanici:

```text
email: analyst@example.com
password: ChangeMe123!
role: cti_analyst
```

## Backend'i Calistirma

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Bu komut API sunucusunu baslatir. `--reload`, kod degisince backend'in kendini yenilemesini saglar.

Backend acildiginda otomatik feed scheduler da baslar. Varsayilan olarak her 30 dakikada bir ucretsiz kaynaklari kontrol eder:

- CISA KEV
- CISA Advisories
- CISA News
- BleepingComputer
- SecurityWeek
- The Hacker News
- PortSwigger
- Ars Technica Security
- Check Point Research

Scheduler ayarlari `.env` icinden degistirilebilir:

```env
FEED_SCHEDULER_ENABLED=true
FEED_SCHEDULER_INTERVAL_MINUTES=30
FEED_SCHEDULER_LIMIT_PER_SOURCE=3
FEED_SCHEDULER_CISA_KEV_LIMIT=10
```

Backend kapaliysa otomatik import calismaz. Gercek ortamda backend sunucuda surekli acik kalacagi icin feedler duzenli kontrol edilir.

Swagger:

```text
http://127.0.0.1:8000/docs
```

Health kontrol:

```text
http://127.0.0.1:8000/health
```

## Swagger'da Login ve Authorize

1. Swagger'da `POST /api/v1/auth/login` endpointini ac.
2. `Try it out` butonuna bas.
3. Su JSON'u gonder:

```json
{
  "email": "analyst@example.com",
  "password": "ChangeMe123!"
}
```

4. Response icindeki `access_token` degerini kopyala.
5. Sag ustteki `Authorize` butonuna bas.
6. Kutunun icine sadece token degerini yapistir.

Dogru:

```text
eyJhbGciOiJIUzI1NiIs...
```

Yanlis:

```text
Bearer eyJhbGciOiJIUzI1NiIs...
Bearer Bearer TOKEN
```

Swagger zaten tokenin basina `Bearer` ekler.

## Endpoint Test Sirasi

Once login ol ve Authorize yap. Sonra su sirayla test et:

```text
GET /api/v1/users/me
GET /api/v1/threats
GET /api/v1/iocs/search?value=malicious-example.com
POST /api/v1/ai/threat-summary
POST /api/v1/favorites
GET /api/v1/favorites
DELETE /api/v1/favorites/{favorite_id}
GET /api/v1/notifications
PATCH /api/v1/notifications/{notification_id}/read
PATCH /api/v1/notifications/read-all
POST /api/v1/feeds/import/cisa-kev
POST /api/v1/feeds/import/free-news
```

## Endpoint Ozeti

| Endpoint | Ne yapar? | Token gerekli mi? |
| --- | --- | --- |
| `GET /health` | Backend ayakta mi kontrol eder. | Hayir |
| `GET /api/v1/health` | API v1 health kontrolu. | Hayir |
| `POST /api/v1/auth/login` | Email ve parola ile token verir. | Hayir |
| `GET /api/v1/users/me` | Giris yapan kullaniciyi getirir. | Evet |
| `GET /api/v1/threats` | Tehdit listesini getirir. | Evet |
| `GET /api/v1/threats/{threat_id}` | Tek tehdit detayini getirir. | Evet |
| `GET /api/v1/iocs/search` | IOC/domain/IP aramasi yapar. | Evet |
| `POST /api/v1/ai/threat-summary` | Mock AI tehdit ozeti uretir. | Evet |
| `POST /api/v1/favorites` | Threat veya IOC favoriler. | Evet |
| `GET /api/v1/favorites` | Favorileri listeler. | Evet |
| `DELETE /api/v1/favorites/{favorite_id}` | Favoriyi siler. | Evet |
| `GET /api/v1/notifications` | Bildirimleri listeler. | Evet |
| `PATCH /api/v1/notifications/{notification_id}/read` | Bir bildirimi okundu yapar. | Evet |
| `PATCH /api/v1/notifications/read-all` | Tum bildirimleri okundu yapar. | Evet |
| `POST /api/v1/feeds/import/cisa-kev` | CISA KEV gercek zafiyet verilerini manuel ice aktarir. | Evet |
| `POST /api/v1/feeds/import/free-news` | Ucretsiz RSS haber kaynaklarini manuel ice aktarir. | Evet |

## PgAdmin Bilgileri

Docker PostgreSQL baglantisi:

```text
Host: localhost
Port: 5432
Database: cti_mobile
Username: cti_mobile
Password: cti_mobile_password
```

Tablolari gormek icin:

```text
Servers -> CTI-Mobile Local -> Databases -> cti_mobile -> Schemas -> public -> Tables
```

## Sik Karsilasilan Durumlar

`401 Unauthorized`:

- Token girilmemistir.
- Token suresi dolmustur.
- Authorize kutusuna yanlislikla `Bearer` yazilmistir.

`Docker connection failed`:

- Docker Desktop acik degildir.
- `docker compose up -d postgres` calistirilmamistir.

`Python bulunamadi`:

- Sistem PATH ayari eksik olabilir.
- `.\.venv\Scripts\python.exe` kullan.

## Git

Degisiklikleri GitHub'a gondermek icin proje kok klasorunde:

```powershell
git status
git push origin main
```
