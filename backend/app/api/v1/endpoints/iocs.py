from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import IOC, Threat, ThreatIOC, User

router = APIRouter()


def detect_ioc_type(value: str) -> str:
    lowered = value.lower()
    if "@" in lowered:
        return "email"
    if lowered.startswith("http://") or lowered.startswith("https://"):
        return "url"
    if all(part.isdigit() for part in lowered.split(".")) and lowered.count(".") == 3:
        return "ip"
    if len(lowered) in {32, 40, 64} and all(char in "0123456789abcdef" for char in lowered):
        return "hash"
    if "." in lowered:
        return "domain"
    return "other"


@router.get("/search")
def search_iocs(
    value: str = Query(..., min_length=2),
    type: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    detected_type = type or detect_ioc_type(value)
    normalized_value = value.lower().strip()
    iocs = db.scalars(
        select(IOC).where(
            IOC.normalized_value == normalized_value,
            IOC.type == detected_type,
        )
    ).all()
    results = []
    for ioc in iocs:
        related_threat_count = db.scalar(
            select(func.count()).select_from(ThreatIOC).where(ThreatIOC.ioc_id == ioc.id)
        )
        related_threats = db.scalars(
            select(Threat)
            .join(ThreatIOC, ThreatIOC.threat_id == Threat.id)
            .where(ThreatIOC.ioc_id == ioc.id)
            .order_by(Threat.published_at.desc().nullslast(), Threat.created_at.desc())
            .limit(3)
        ).all()
        results.append(
            {
                "id": str(ioc.id),
                "type": ioc.type,
                "value": ioc.value,
                "risk_score": ioc.risk_score,
                "confidence_score": ioc.confidence_score,
                "related_threat_count": related_threat_count,
                "related_threats": [
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
                        "published_at": threat.published_at.isoformat()
                        if threat.published_at
                        else threat.created_at.isoformat(),
                        "is_favorite": False,
                    }
                    for threat in related_threats
                ],
            }
        )

    return {"data": {"query": value, "detected_type": detected_type, "results": results}}
