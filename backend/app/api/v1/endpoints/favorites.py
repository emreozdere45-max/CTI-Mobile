from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Favorite, IOC, Threat, User
from app.schemas.favorite import FavoriteCreateRequest

router = APIRouter()


def get_target_or_404(db: Session, target_type: str, target_id: UUID) -> Threat | IOC:
    if target_type == "threat":
        target = db.get(Threat, target_id)
    elif target_type == "ioc":
        target = db.get(IOC, target_id)
    else:
        raise HTTPException(status_code=400, detail="target_type must be threat or ioc")

    if target is None:
        raise HTTPException(status_code=404, detail="Favorite target not found")
    return target


def serialize_target(target_type: str, target: Threat | IOC) -> dict:
    if target_type == "threat":
        return {
            "id": str(target.id),
            "title": target.title,
            "summary": target.summary,
            "severity": target.severity,
        }

    return {
        "id": str(target.id),
        "type": target.type,
        "value": target.value,
        "risk_score": target.risk_score,
    }


def serialize_favorite(db: Session, favorite: Favorite) -> dict:
    target = get_target_or_404(db, favorite.target_type, favorite.target_id)
    return {
        "id": str(favorite.id),
        "target_type": favorite.target_type,
        "target_id": str(favorite.target_id),
        "target": serialize_target(favorite.target_type, target),
        "created_at": favorite.created_at.isoformat(),
    }


@router.post("")
def create_favorite(
    payload: FavoriteCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    target_type = payload.target_type.lower().strip()
    get_target_or_404(db, target_type, payload.target_id)

    existing = db.scalar(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.target_type == target_type,
            Favorite.target_id == payload.target_id,
        )
    )
    if existing is not None:
        return {"data": serialize_favorite(db, existing)}

    favorite = Favorite(
        user_id=current_user.id,
        target_type=target_type,
        target_id=payload.target_id,
    )
    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return {"data": serialize_favorite(db, favorite)}


@router.get("")
def list_favorites(
    target_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    query = select(Favorite).where(Favorite.user_id == current_user.id).order_by(Favorite.created_at.desc())
    if target_type:
        normalized_type = target_type.lower().strip()
        if normalized_type not in {"threat", "ioc"}:
            raise HTTPException(status_code=400, detail="target_type must be threat or ioc")
        query = query.where(Favorite.target_type == normalized_type)

    favorites = db.scalars(query).all()
    return {
        "data": [serialize_favorite(db, favorite) for favorite in favorites],
        "meta": {"total": len(favorites)},
    }


@router.delete("/{favorite_id}")
def delete_favorite(
    favorite_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    favorite = db.scalar(
        select(Favorite).where(
            Favorite.id == favorite_id,
            Favorite.user_id == current_user.id,
        )
    )
    if favorite is None:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(favorite)
    db.commit()
    return {"data": {"success": True}}
