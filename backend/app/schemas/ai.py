from pydantic import BaseModel


class ThreatSummaryRequest(BaseModel):
    threat_id: str
    summary_type: str = "analyst_brief"


class ThreatSummaryResponse(BaseModel):
    data: dict
