from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Notification, ThreatIOC, User

router = APIRouter()


def resolve_target_threat_id(db: Session, notification: Notification) -> str | None:
    if notification.target_type == "threat" and notification.target_id:
        return str(notification.target_id)

    if notification.target_type == "ioc" and notification.target_id:
        link = db.scalar(select(ThreatIOC).where(ThreatIOC.ioc_id == notification.target_id).limit(1))
        if link is not None:
            return str(link.threat_id)

    return None


def serialize_notification(db: Session, notification: Notification) -> dict:
    return {
        "id": str(notification.id),
        "notification_type": notification.notification_type,
        "title": notification.title,
        "message": notification.message,
        "severity": notification.severity,
        "target_type": notification.target_type,
        "target_id": str(notification.target_id) if notification.target_id else None,
        "target_threat_id": resolve_target_threat_id(db, notification),
        "is_read": notification.is_read,
        "read_at": notification.read_at.isoformat() if notification.read_at else None,
        "created_at": notification.created_at.isoformat(),
    }


@router.get("")
def list_notifications(
    unread_only: bool = Query(default=False),
    notification_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    query = select(Notification).where(Notification.user_id == current_user.id)

    if unread_only:
        query = query.where(Notification.is_read.is_(False))
    if notification_type:
        query = query.where(Notification.notification_type == notification_type.strip())

    notifications = db.scalars(query.order_by(Notification.created_at.desc())).all()
    unread_count = db.scalar(
        select(func.count(Notification.id)).where(
            Notification.user_id == current_user.id,
            Notification.is_read.is_(False),
        )
    )

    return {
        "data": [serialize_notification(db, notification) for notification in notifications],
        "meta": {
            "total": len(notifications),
            "unread_count": unread_count or 0,
        },
    }


@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    notification = db.scalar(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    notification.read_at = datetime.now(UTC)
    db.commit()
    db.refresh(notification)

    return {"data": serialize_notification(db, notification)}


@router.patch("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    notifications = db.scalars(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.is_read.is_(False),
        )
    ).all()

    now = datetime.now(UTC)
    for notification in notifications:
        notification.is_read = True
        notification.read_at = now

    db.commit()
    return {"data": {"updated_count": len(notifications)}}
