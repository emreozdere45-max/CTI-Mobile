from pydantic import BaseModel


class ThreatSummaryRequest(BaseModel):
    threat_id: str
    summary_type: str = "short"


class ThreatSummaryResponse(BaseModel):
    data: dict
