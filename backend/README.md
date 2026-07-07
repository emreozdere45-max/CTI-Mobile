# CTI-Mobile Backend

FastAPI tabanli CTI-Mobile backend iskeleti.

## Calistirma

Once Python 3.11 veya 3.12 kurulu olmali. Terminalde kontrol:

```bash
python --version
```

Komut bulunamazsa Python'u kurup "Add Python to PATH" secenegini isaretle.

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

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

Baglanti adresi `.env.example` icinde hazirdir:

```text
DATABASE_URL=postgresql+psycopg://cti_mobile:cti_mobile_password@localhost:5432/cti_mobile
```
