from pydantic import BaseModel


class FeedImportResponse(BaseModel):
    data: dict
