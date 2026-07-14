from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import IOC, Source, Threat, ThreatIOC


DEMO_FEED_ITEMS = [
    {
        "external_id": "demo-feed-credential-phishing-001",
        "title": "Credential phishing kit targets finance portals",
        "summary": "A phishing kit is impersonating finance portals to collect corporate passwords.",
        "description": "The campaign uses lookalike domains and fake invoice workflows to steal credentials from finance teams.",
        "severity": "high",
        "confidence_score": 86,
        "industry": "finance",
        "region": "global",
        "tags": ["phishing", "credential-theft", "finance"],
        "published_at": "2026-07-14T08:30:00+00:00",
        "iocs": [
            {
                "type": "domain",
                "value": "secure-invoice-portal.example",
                "risk_score": 88,
                "confidence_score": 82,
            },
            {
                "type": "url",
                "value": "https://secure-invoice-portal.example/login",
                "risk_score": 90,
                "confidence_score": 80,
            },
        ],
    },
    {
        "external_id": "demo-feed-malware-loader-002",
        "title": "Malware loader infrastructure observed in email campaign",
        "summary": "A malware loader is being distributed through attachment-based email lures.",
        "description": "Observed infrastructure delivers a downloader that may lead to ransomware deployment if execution succeeds.",
        "severity": "critical",
        "confidence_score": 91,
        "industry": "multiple",
        "region": "global",
        "tags": ["malware", "loader", "email"],
        "published_at": "2026-07-14T09:15:00+00:00",
        "iocs": [
            {
                "type": "ip",
                "value": "198.51.100.77",
                "risk_score": 86,
                "confidence_score": 78,
            },
            {
                "type": "hash",
                "value": "44d88612fea8a8f36de82e1278abb02f",
                "risk_score": 94,
                "confidence_score": 88,
            },
        ],
    },
]


def import_demo_feed(db: Session, *, imported_by: str) -> dict:
    source = get_or_create_feed_source(db)
    created_threats = 0
    reused_threats = 0
    created_iocs = 0
    reused_iocs = 0
    created_links = 0

    for item in DEMO_FEED_ITEMS:
        threat, threat_created = get_or_create_feed_threat(
            db,
            item=item,
            source=source,
            imported_by=imported_by,
        )
        if threat_created:
            created_threats += 1
        else:
            reused_threats += 1

        for ioc_item in item["iocs"]:
            ioc, ioc_created = get_or_create_ioc(db, ioc_item=ioc_item)
            if ioc_created:
                created_iocs += 1
            else:
                reused_iocs += 1

            if link_threat_ioc(db, threat=threat, ioc=ioc):
                created_links += 1

    db.commit()

    return {
        "source": {"id": str(source.id), "name": source.name},
        "created_threats": created_threats,
        "reused_threats": reused_threats,
        "created_iocs": created_iocs,
        "reused_iocs": reused_iocs,
        "created_links": created_links,
        "feed_item_count": len(DEMO_FEED_ITEMS),
    }


def get_or_create_feed_source(db: Session) -> Source:
    source = db.scalar(select(Source).where(Source.name == "Demo External Feed"))
    if source is not None:
        return source

    source = Source(
        name="Demo External Feed",
        source_type="demo_feed",
        trust_score=75,
        is_active=True,
        source_metadata={
            "description": "Local mock external feed for development",
            "provider": "CTI-Mobile demo",
        },
    )
    db.add(source)
    db.flush()
    return source


def get_or_create_feed_threat(
    db: Session,
    *,
    imported_by: str,
    item: dict,
    source: Source,
) -> tuple[Threat, bool]:
    threat = db.scalar(select(Threat).where(Threat.raw_data.contains({"external_id": item["external_id"]})))
    if threat is not None:
        return threat, False

    threat = Threat(
        source_id=source.id,
        title=item["title"],
        summary=item["summary"],
        description=item["description"],
        severity=item["severity"],
        confidence_score=item["confidence_score"],
        industry=item["industry"],
        region=item["region"],
        tags=item["tags"],
        published_at=datetime.fromisoformat(item["published_at"]).astimezone(UTC),
        raw_data={
            "external_id": item["external_id"],
            "feed": "demo_external_feed",
            "imported_by": imported_by,
        },
    )
    db.add(threat)
    db.flush()
    return threat, True


def get_or_create_ioc(db: Session, *, ioc_item: dict) -> tuple[IOC, bool]:
    normalized_value = ioc_item["value"].lower().strip()
    ioc = db.scalar(
        select(IOC).where(
            IOC.type == ioc_item["type"],
            IOC.normalized_value == normalized_value,
        )
    )
    if ioc is not None:
        return ioc, False

    ioc = IOC(
        type=ioc_item["type"],
        value=ioc_item["value"],
        normalized_value=normalized_value,
        risk_score=ioc_item["risk_score"],
        confidence_score=ioc_item["confidence_score"],
        ioc_metadata={"feed": "demo_external_feed"},
    )
    db.add(ioc)
    db.flush()
    return ioc, True


def link_threat_ioc(db: Session, *, threat: Threat, ioc: IOC) -> bool:
    existing = db.scalar(
        select(ThreatIOC).where(
            ThreatIOC.threat_id == threat.id,
            ThreatIOC.ioc_id == ioc.id,
        )
    )
    if existing is not None:
        return False

    db.add(ThreatIOC(threat_id=threat.id, ioc_id=ioc.id, relationship_type="feed_observed"))
    db.flush()
    return True
