from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import AISummary, Threat, User
from app.schemas.ai import ThreatSummaryRequest

router = APIRouter()


def build_analyst_brief(threat: Threat) -> str:
    ioc_values = [ioc.value for ioc in threat.iocs]
    ioc_text = ", ".join(ioc_values[:5]) if ioc_values else "No IOC is attached yet."
    source_name = threat.source.name if threat.source else "Unknown source"
    impacted_area = infer_impacted_area(threat)
    urgency = infer_urgency(threat.severity)
    checks = build_checklist(threat, ioc_values)

    return "\n".join(
        [
            "Why it matters",
            f"- This item comes from {source_name} and should be reviewed as {urgency}.",
            f"- Main signal: {threat.summary}",
            "",
            "Who may be affected",
            f"- {impacted_area}",
            "",
            "What to check",
            *[f"- {item}" for item in checks],
            "",
            "Recommended action",
            f"- {build_recommended_action(threat)}",
            "",
            "Analyst decision",
            f"- Priority: {build_priority_label(threat.severity)}",
            f"- IOC focus: {ioc_text}",
        ]
    )


def infer_urgency(severity: str) -> str:
    if severity == "critical":
        return "an urgent same-day investigation"
    if severity == "high":
        return "a high-priority investigation"
    if severity == "medium":
        return "a scheduled validation task"
    return "a monitoring item"


def infer_impacted_area(threat: Threat) -> str:
    tags = {tag.lower() for tag in threat.tags}
    text = f"{threat.title} {threat.summary} {threat.description or ''}".lower()

    if "android" in tags or "android" in text:
        return "Android/mobile users, mobile apps, and endpoint teams may need to validate exposure."
    if "windows" in tags or "windows" in text:
        return "Windows endpoints, identity systems, and SOC monitoring rules may be affected."
    if "cloud" in tags or "cloud" in text:
        return "Cloud services, exposed applications, and identity providers should be reviewed."
    if "phishing" in tags or "phishing" in text:
        return "Email users, helpdesk teams, and identity/security monitoring workflows are most relevant."
    if "vulnerability" in tags or "cve" in text:
        return "Asset owners should check whether affected products or CVEs exist in the environment."
    return "SOC analysts and asset owners should validate whether this applies to monitored systems."


def build_checklist(threat: Threat, ioc_values: list[str]) -> list[str]:
    checks = []
    text = f"{threat.title} {threat.summary} {threat.description or ''}".lower()

    if ioc_values:
        checks.append("Search attached IOCs in SIEM, DNS, proxy, EDR, and firewall logs.")
    else:
        checks.append("Extract IOCs from the original source before creating detection rules.")

    if "cve-" in text or "vulnerability" in text:
        checks.append("Check asset inventory for affected products and patch status.")
    if "phishing" in text or "credential" in text:
        checks.append("Review recent email, login, and MFA events for suspicious activity.")
    if "ransomware" in text or "malware" in text:
        checks.append("Review endpoint alerts, blocked executions, and recent containment events.")

    checks.append("Open the original source and confirm whether the threat is relevant to your environment.")
    return checks[:5]


def build_recommended_action(threat: Threat) -> str:
    if threat.severity == "critical":
        return "Validate exposure today, notify the responsible team, and apply patching or blocking if relevant."
    if threat.severity == "high":
        return "Create a short investigation task, search indicators, and monitor related systems closely."
    if threat.severity == "medium":
        return "Track the item, validate affected assets, and schedule follow-up if matching systems exist."
    return "Keep it in monitoring and revisit if new IOCs, CVEs, or exploitation details appear."


def build_priority_label(severity: str) -> str:
    if severity == "critical":
        return "Act today"
    if severity == "high":
        return "Investigate soon"
    if severity == "medium":
        return "Validate when possible"
    return "Monitor"


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

    if payload.summary_type not in {"analyst_brief", "short"}:
        raise HTTPException(status_code=400, detail="Only analyst briefs are supported in MVP")

    content = build_analyst_brief(threat)
    summary = AISummary(
        user_id=current_user.id,
        threat_id=threat.id,
        summary_type="analyst_brief",
        content=content,
        model="mock-analyst-v1",
        prompt_version="analyst_brief_v1",
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
