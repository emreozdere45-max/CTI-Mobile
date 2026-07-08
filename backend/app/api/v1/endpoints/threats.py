from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models import Threat

router = APIRouter()


@router.get("")
def list_threats(db: Session = Depends(get_db)) -> dict:
    threats = db.scalars(
        select(Threat).options(selectinload(Threat.source)).order_by(Threat.published_at.desc())
    ).all()
    data = [
        {
            "id": str(threat.id),
            "title": threat.title,
            "summary": threat.summary,
            "severity": threat.severity,
            "confidence_score": threat.confidence_score,
            "source": {
                "id": str(threat.source.id),
                "name": threat.source.name,
            }
            if threat.source
            else None,
            "tags": threat.tags,
            "published_at": threat.published_at.isoformat() if threat.published_at else None,
            "is_favorite": False,
        }
        for threat in threats
    ]

    return {
        "data": data,
        "meta": {"page": 1, "page_size": len(data), "total": len(data)},
    }


@router.get("/{threat_id}")
def get_threat(threat_id: str, db: Session = Depends(get_db)) -> dict:
    threat = db.scalar(
        select(Threat)
        .where(Threat.id == threat_id)
        .options(
            selectinload(Threat.source),
            selectinload(Threat.iocs),
        )
    )
    if threat is None:
        raise HTTPException(status_code=404, detail="Threat not found")

    return {
        "data": {
            "id": str(threat.id),
            "title": threat.title,
            "summary": threat.summary,
            "description": threat.description,
            "severity": threat.severity,
            "confidence_score": threat.confidence_score,
            "source": {
                "id": str(threat.source.id),
                "name": threat.source.name,
            }
            if threat.source
            else None,
            "tags": threat.tags,
            "published_at": threat.published_at.isoformat() if threat.published_at else None,
            "is_favorite": False,
            "iocs": [
                {"id": str(ioc.id), "type": ioc.type, "value": ioc.value, "risk_score": ioc.risk_score}
                for ioc in threat.iocs
            ],
            "recommended_actions": [
                "Domain engelleme listesine eklenmeli.",
                "Son 30 gun DNS ve proxy loglari kontrol edilmeli.",
            ],
        }
    }
