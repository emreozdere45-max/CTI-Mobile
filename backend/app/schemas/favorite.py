from uuid import UUID

from pydantic import BaseModel


class FavoriteCreateRequest(BaseModel):
    target_type: str
    target_id: UUID


class FavoriteResponse(BaseModel):
    data: dict
