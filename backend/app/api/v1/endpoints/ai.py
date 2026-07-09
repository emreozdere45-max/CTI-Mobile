from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import AISummary, Threat, User
from app.schemas.ai import ThreatSummaryRequest

router = APIRouter()


def build_mock_summary(threat: Threat) -> str:
    ioc_values = ", ".join(ioc.value for ioc in threat.iocs) or "Kayitli IOC yok"
    actions = [
        f"{threat.severity.upper()} seviyesinde tehdit olarak onceliklendirilmeli.",
        f"Iliskili IOC'ler kontrol edilmeli: {ioc_values}.",
        "DNS, proxy ve EDR loglari ilgili zaman araligi icin taranmali.",
    ]
    return "\n".join(f"- {item}" for item in actions)


@router.post("/threat-summary")
def create_threat_summary(
    payload: ThreatSummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    threat = db.scalar(
        select(Threat)
        .where(Threat.id == payload.threat_id)
        .options(
            selectinload(Threat.iocs),
            selectinload(Threat.source),
        )
    )
    if threat is None:
        raise HTTPException(status_code=404, detail="Threat not found")

    if payload.summary_type != "short":
        raise HTTPException(status_code=400, detail="Only short summaries are supported in MVP")

    content = build_mock_summary(threat)
    summary = AISummary(
        user_id=current_user.id,
        threat_id=threat.id,
        summary_type=payload.summary_type,
        content=content,
        model="mock-ai-v1",
        prompt_version="threat_summary_short_v1",
        status="success",
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)

    return {
        "data": {
            "id": str(summary.id),
            "threat_id": str(threat.id),
            "summary_type": summary.summary_type,
            "content": summary.content,
            "model": summary.model,
            "prompt_version": summary.prompt_version,
            "created_at": summary.created_at.isoformat(),
        }
    }
