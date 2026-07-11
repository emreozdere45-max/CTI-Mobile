from pydantic import BaseModel


class NotificationResponse(BaseModel):
    data: dict


class NotificationListResponse(BaseModel):
    data: list[dict]
    meta: dict
