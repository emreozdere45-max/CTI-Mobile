from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models import Source, Threat, User
from app.schemas.threat import ThreatCreateRequest, ThreatListResponse, ThreatResponse, ThreatUpdateRequest

router = APIRouter()

THREAT_EDITOR_ROLES = {"cti_admin", "cti_analyst"}


def serialize_source(source: Source | None) -> dict | None:
    if source is None:
        return None

    return {
        "id": str(source.id),
        "name": source.name,
    }


def serialize_threat_summary(threat: Threat) -> dict:
    return {
        "id": str(threat.id),
        "title": threat.title,
        "summary": threat.summary,
        "severity": threat.severity,
        "confidence_score": threat.confidence_score,
        "source": serialize_source(threat.source),
        "tags": threat.tags,
        "published_at": threat.published_at.isoformat() if threat.published_at else None,
        "is_favorite": False,
    }


def serialize_threat_detail(threat: Threat) -> dict:
    return {
        **serialize_threat_summary(threat),
        "description": threat.description,
        "industry": threat.industry,
        "region": threat.region,
        "iocs": [
            {"id": str(ioc.id), "type": ioc.type, "value": ioc.value, "risk_score": ioc.risk_score}
            for ioc in threat.iocs
        ],
        "recommended_actions": [
            "Add malicious infrastructure to blocklists.",
            "Review DNS and proxy logs for the last 30 days.",
        ],
    }


def get_source_or_404(db: Session, source_id: UUID | None) -> Source | None:
    if source_id is None:
        return None

    source = db.get(Source, source_id)
    if source is None:
        raise HTTPException(status_code=404, detail="Source not found")
    return source


def get_threat_or_404(db: Session, threat_id: str) -> Threat:
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
    return threat


@router.get("", response_model=ThreatListResponse)
def list_threats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    threats = db.scalars(
        select(Threat).options(selectinload(Threat.source)).order_by(Threat.published_at.desc())
    ).all()
    data = [serialize_threat_summary(threat) for threat in threats]

    return {
        "data": data,
        "meta": {"page": 1, "page_size": len(data), "total": len(data)},
    }


@router.post("", response_model=ThreatResponse, status_code=201)
def create_threat(
    payload: ThreatCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    require_roles(current_user, THREAT_EDITOR_ROLES)
    get_source_or_404(db, payload.source_id)

    threat = Threat(
        title=payload.title,
        summary=payload.summary,
        description=payload.description,
        severity=payload.severity,
        confidence_score=payload.confidence_score,
        industry=payload.industry,
        region=payload.region,
        tags=payload.tags,
        source_id=payload.source_id,
        published_at=payload.published_at,
        raw_data={"created_by": str(current_user.id), "entry_type": "manual"},
    )
    db.add(threat)
    db.commit()
    db.refresh(threat)

    threat = get_threat_or_404(db, str(threat.id))
    return {"data": serialize_threat_detail(threat)}


@router.get("/{threat_id}", response_model=ThreatResponse)
def get_threat(
    threat_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    threat = get_threat_or_404(db, threat_id)
    return {"data": serialize_threat_detail(threat)}


@router.put("/{threat_id}", response_model=ThreatResponse)
def update_threat(
    threat_id: str,
    payload: ThreatUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    require_roles(current_user, THREAT_EDITOR_ROLES)
    threat = get_threat_or_404(db, threat_id)

    update_data = payload.model_dump(exclude_unset=True)
    if "source_id" in update_data:
        get_source_or_404(db, update_data["source_id"])

    for field, value in update_data.items():
        setattr(threat, field, value)

    raw_data = dict(threat.raw_data or {})
    raw_data["updated_by"] = str(current_user.id)
    threat.raw_data = raw_data

    db.add(threat)
    db.commit()
    threat = get_threat_or_404(db, threat_id)

    return {"data": serialize_threat_detail(threat)}


@router.delete("/{threat_id}")
def delete_threat(
    threat_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    require_roles(current_user, THREAT_EDITOR_ROLES)
    threat = get_threat_or_404(db, threat_id)

    db.delete(threat)
    db.commit()

    return {"data": {"success": True}}
