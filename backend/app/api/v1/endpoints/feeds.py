from fastapi import APIRouter, Depends, HTTPException, Query
from httpx import HTTPError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models import User
from app.schemas.feed import FeedImportResponse
from app.services.feed_importer import import_cisa_kev_feed, import_demo_feed, import_free_news_feeds

router = APIRouter()

FEED_IMPORT_ROLES = {"cti_admin", "cti_analyst"}


@router.post("/import", response_model=FeedImportResponse)
def import_feed(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    require_roles(current_user, FEED_IMPORT_ROLES)
    result = import_demo_feed(db, imported_by=str(current_user.id))
    return {"data": result}


@router.post("/import/cisa-kev", response_model=FeedImportResponse)
def import_cisa_kev(
    limit: int = Query(default=25, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    require_roles(current_user, FEED_IMPORT_ROLES)
    try:
        result = import_cisa_kev_feed(db, imported_by=str(current_user.id), limit=limit)
    except HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail=f"CISA KEV feed could not be fetched: {error}",
        ) from error
    return {"data": result}


@router.post("/import/free-news", response_model=FeedImportResponse)
def import_free_news(
    limit_per_source: int = Query(default=5, ge=1, le=25),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    require_roles(current_user, FEED_IMPORT_ROLES)
    result = import_free_news_feeds(db, imported_by=str(current_user.id), limit_per_source=limit_per_source)
    return {"data": result}
