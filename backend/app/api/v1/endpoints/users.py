from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models import User

router = APIRouter()


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)) -> dict:
    return {
        "data": {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "roles": [role.name for role in current_user.roles],
            "status": current_user.status,
        }
    }
