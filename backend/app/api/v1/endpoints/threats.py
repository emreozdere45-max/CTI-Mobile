from fastapi import APIRouter, HTTPException

from app.services.demo_data import DEMO_THREATS

router = APIRouter()


@router.get("")
def list_threats() -> dict:
    return {
        "data": DEMO_THREATS,
        "meta": {"page": 1, "page_size": len(DEMO_THREATS), "total": len(DEMO_THREATS)},
    }


@router.get("/{threat_id}")
def get_threat(threat_id: str) -> dict:
    threat = next((item for item in DEMO_THREATS if item["id"] == threat_id), None)
    if threat is None:
        raise HTTPException(status_code=404, detail="Threat not found")

    return {
        "data": {
            **threat,
            "description": "Bu demo kayit, ileride PostgreSQL veritabanindan gelecek gercek tehdit detayini temsil eder.",
            "iocs": [
                {"id": "ioc-001", "type": "domain", "value": "malicious-example.com", "risk_score": 92}
            ],
            "recommended_actions": [
                "Domain engelleme listesine eklenmeli.",
                "Son 30 gun DNS ve proxy loglari kontrol edilmeli.",
            ],
        }
    }
