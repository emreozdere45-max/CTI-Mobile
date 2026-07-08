# CTI-Mobile Backend

FastAPI tabanli CTI-Mobile backend iskeleti.

## Calistirma

Once Python 3.11 veya 3.12 kurulu olmali. Terminalde kontrol:

```bash
python --version
```

Komut bulunamazsa Python'u kurup "Add Python to PATH" secenegini isaretle.

Sanal ortam olustur:

```bash
python -m venv .venv
```

Bu komut proje icin izole bir Python alani olusturur. Boylece bu projenin paketleri bilgisayarindaki diger Python projelerini bozmaz.

Sanal ortami aktif et:

```bash
.venv\Scripts\activate
```

Bu komuttan sonra terminalin basinda `(.venv)` gorursun. Bu, paketleri artik proje icindeki sanal ortama kurdugun anlamina gelir.

Paketleri kur:

```bash
pip install -r requirements.txt
```

Bu komut FastAPI, SQLAlchemy, Alembic ve test paketlerini kurar.

API'yi baslat:

```bash
uvicorn app.main:app --reload
```

Bu komut backend'i calistirir. `--reload`, kod degisince sunucunun kendini yenilemesini saglar.

API calistiktan sonra:

- Health: http://127.0.0.1:8000/health
- Docs: http://127.0.0.1:8000/docs
- Threats: http://127.0.0.1:8000/api/v1/threats
- IOC search: http://127.0.0.1:8000/api/v1/iocs/search?value=malicious-example.com

## PostgreSQL

Docker kurulduktan sonra proje kok klasorunde PostgreSQL'i baslat:

```bash
docker compose up -d postgres
```

Backend klasorunde migration calistir:

```bash
alembic upgrade head
```

Bu komut PostgreSQL icinde tabloları olusturur.

Demo CTI verilerini PostgreSQL'e ekle:

```bash
python -m app.db.seed
```

Bu komut `sources`, `threats`, `iocs` ve `threat_iocs` tablolarina baslangic demo verilerini ekler.

Baglanti adresi `.env.example` icinde hazirdir:

```text
DATABASE_URL=postgresql+psycopg://cti_mobile:cti_mobile_password@localhost:5432/cti_mobile
```
