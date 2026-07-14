from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models import User
from app.schemas.feed import FeedImportResponse
from app.services.feed_importer import import_demo_feed

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
