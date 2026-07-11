from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import IOC, Notification, Role, Source, Threat, ThreatIOC, User, UserRole


def parse_dt(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(UTC)


def get_or_create_source(db: Session) -> Source:
    source = db.scalar(select(Source).where(Source.name == "Internal CTI"))
    if source is not None:
        return source

    source = Source(
        name="Internal CTI",
        source_type="manual",
        trust_score=90,
        is_active=True,
        source_metadata={"description": "Local demo CTI source"},
    )
    db.add(source)
    db.flush()
    return source


def get_or_create_ioc(
    db: Session,
    *,
    ioc_type: str,
    value: str,
    risk_score: int,
    confidence_score: int,
) -> IOC:
    normalized_value = value.lower().strip()
    ioc = db.scalar(
        select(IOC).where(
            IOC.type == ioc_type,
            IOC.normalized_value == normalized_value,
        )
    )
    if ioc is not None:
        return ioc

    ioc = IOC(
        type=ioc_type,
        value=value,
        normalized_value=normalized_value,
        risk_score=risk_score,
        confidence_score=confidence_score,
        ioc_metadata={},
    )
    db.add(ioc)
    db.flush()
    return ioc


def get_or_create_threat(
    db: Session,
    *,
    source: Source,
    title: str,
    summary: str,
    description: str,
    severity: str,
    confidence_score: int,
    tags: list[str],
    published_at: str,
) -> Threat:
    threat = db.scalar(select(Threat).where(Threat.title == title))
    if threat is not None:
        return threat

    threat = Threat(
        source_id=source.id,
        title=title,
        summary=summary,
        description=description,
        severity=severity,
        confidence_score=confidence_score,
        industry="finance" if "finans" in title.lower() else None,
        region="global",
        tags=tags,
        published_at=parse_dt(published_at),
        raw_data={},
    )
    db.add(threat)
    db.flush()
    return threat


def link_threat_ioc(db: Session, threat: Threat, ioc: IOC) -> None:
    existing = db.scalar(
        select(ThreatIOC).where(
            ThreatIOC.threat_id == threat.id,
            ThreatIOC.ioc_id == ioc.id,
        )
    )
    if existing is not None:
        return

    db.add(ThreatIOC(threat_id=threat.id, ioc_id=ioc.id, relationship_type="observed"))


def get_or_create_role(db: Session, *, name: str, description: str) -> Role:
    role = db.scalar(select(Role).where(Role.name == name))
    if role is not None:
        return role

    role = Role(name=name, description=description)
    db.add(role)
    db.flush()
    return role


def get_or_create_user(db: Session, *, role: Role) -> User:
    email = "analyst@example.com"
    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        user = User(
            email=email,
            password_hash=hash_password("ChangeMe123!"),
            full_name="Demo CTI Analyst",
            status="active",
        )
        db.add(user)
        db.flush()

    existing_link = db.scalar(
        select(UserRole).where(
            UserRole.user_id == user.id,
            UserRole.role_id == role.id,
        )
    )
    if existing_link is None:
        db.add(UserRole(user_id=user.id, role_id=role.id))

    return user


def create_demo_notifications(db: Session, *, user: User, threat: Threat, ioc: IOC) -> None:
    existing_count = db.scalar(select(Notification).where(Notification.user_id == user.id))
    if existing_count is not None:
        return

    db.add_all(
        [
            Notification(
                user_id=user.id,
                notification_type="critical_threat",
                title="Kritik tehdit tespit edildi",
                message="Finans sektorunu hedefleyen yeni fidye yazilimi kampanyasi incelenmeli.",
                severity="critical",
                target_type="threat",
                target_id=threat.id,
            ),
            Notification(
                user_id=user.id,
                notification_type="high_risk_ioc",
                title="Yuksek riskli IOC bulundu",
                message="malicious-example.com riskli domain olarak isaretlendi.",
                severity="high",
                target_type="ioc",
                target_id=ioc.id,
            ),
        ]
    )


def seed_database() -> None:
    db = SessionLocal()
    try:
        source = get_or_create_source(db)

        domain_ioc = get_or_create_ioc(
            db,
            ioc_type="domain",
            value="malicious-example.com",
            risk_score=92,
            confidence_score=80,
        )
        ip_ioc = get_or_create_ioc(
            db,
            ioc_type="ip",
            value="203.0.113.10",
            risk_score=84,
            confidence_score=75,
        )

        ransomware_threat = get_or_create_threat(
            db,
            source=source,
            title="Yeni fidye yazilimi kampanyasi finans sektorunu hedefliyor",
            summary="Finans kurumlarini hedefleyen yuksek riskli kampanya tespit edildi.",
            description="Bu demo kayit, PostgreSQL icindeki ilk CTI tehdit verisini temsil eder.",
            severity="critical",
            confidence_score=85,
            tags=["ransomware", "finance", "phishing"],
            published_at="2026-07-07T10:00:00Z",
        )
        phishing_threat = get_or_create_threat(
            db,
            source=source,
            title="Sahte oturum acma sayfalariyla kimlik avi denemeleri",
            summary="Kurumsal e-posta hesaplarini hedefleyen domainler gozlemlendi.",
            description="Bu demo kayit, kimlik avi odakli ikinci CTI tehdidini temsil eder.",
            severity="high",
            confidence_score=78,
            tags=["phishing", "credential-theft"],
            published_at="2026-07-07T08:30:00Z",
        )

        link_threat_ioc(db, ransomware_threat, domain_ioc)
        link_threat_ioc(db, phishing_threat, ip_ioc)

        analyst_role = get_or_create_role(
            db,
            name="cti_analyst",
            description="Cyber threat intelligence analyst",
        )
        get_or_create_role(db, name="soc_analyst", description="Security operations analyst")
        get_or_create_role(db, name="admin", description="System administrator")
        demo_user = get_or_create_user(db, role=analyst_role)
        create_demo_notifications(db, user=demo_user, threat=ransomware_threat, ioc=domain_ioc)

        db.commit()
        print("Seed data inserted successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
