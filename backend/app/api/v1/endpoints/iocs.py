from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import IOC, Threat, ThreatIOC, User

router = APIRouter()

HIDDEN_RELATED_THREAT_FEEDS = {"demo_external_feed", "github_advisories"}
HIDDEN_RELATED_THREAT_SOURCE_NAMES = {"Demo External Feed", "GitHub Advisory Database", "Internal CTI"}


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


def should_hide_related_threat(threat: Threat) -> bool:
    raw_data = threat.raw_data or {}
    tags = {tag.lower() for tag in threat.tags or []}

    if raw_data.get("feed") in HIDDEN_RELATED_THREAT_FEEDS:
        return True
    if threat.source and threat.source.name in HIDDEN_RELATED_THREAT_SOURCE_NAMES:
        return True
    return "github-advisory" in tags


@router.get("/search")
def search_iocs(
    value: str | None = Query(default=None, min_length=0),
    type: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    normalized_value = (value or "").lower().strip()
    detected_type = type or (detect_ioc_type(normalized_value) if normalized_value else "any")

    statement = select(IOC)
    if normalized_value:
        statement = statement.where(
            or_(
                IOC.normalized_value.ilike(f"%{normalized_value}%"),
                IOC.value.ilike(f"%{normalized_value}%"),
            )
        )
    if type:
        statement = statement.where(IOC.type == type)
    elif detected_type != "other" and normalized_value:
        statement = statement.where(IOC.type == detected_type)

    iocs = db.scalars(
        statement.order_by(IOC.risk_score.desc(), IOC.confidence_score.desc(), IOC.created_at.desc()).limit(25)
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
        visible_related_threats = [
            threat for threat in related_threats if not should_hide_related_threat(threat)
        ]
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
                    for threat in visible_related_threats
                ],
            }
        )

    return {"data": {"query": normalized_value, "detected_type": detected_type, "results": results}}
