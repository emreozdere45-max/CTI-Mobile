from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ThreatCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=500)
    summary: str = Field(..., min_length=10)
    description: str | None = None
    severity: str = Field(..., pattern="^(critical|high|medium|low|info)$")
    confidence_score: int = Field(default=50, ge=0, le=100)
    industry: str | None = None
    region: str | None = None
    tags: list[str] = Field(default_factory=list)
    source_id: UUID | None = None
    published_at: datetime | None = None


class ThreatUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=500)
    summary: str | None = Field(default=None, min_length=10)
    description: str | None = None
    severity: str | None = Field(default=None, pattern="^(critical|high|medium|low|info)$")
    confidence_score: int | None = Field(default=None, ge=0, le=100)
    industry: str | None = None
    region: str | None = None
    tags: list[str] | None = None
    source_id: UUID | None = None
    published_at: datetime | None = None


class ThreatResponse(BaseModel):
    data: dict


class ThreatListResponse(BaseModel):
    data: list[dict]
    meta: dict
