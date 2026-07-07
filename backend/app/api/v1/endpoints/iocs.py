from fastapi import APIRouter, Query

from app.services.demo_data import DEMO_IOCS

router = APIRouter()


def detect_ioc_type(value: str) -> str:
    lowered = value.lower()
    if "@" in lowered:
        return "email"
    if lowered.startswith("http://") or lowered.startswith("https://"):
        return "url"
    if all(part.isdigit() for part in lowered.split(".")) and lowered.count(".") == 3:
        return "ip"
    if len(lowered) in {32, 40, 64} and all(char in "0123456789abcdef" for char in lowered):
        return "hash"
    if "." in lowered:
        return "domain"
    return "other"


@router.get("/search")
def search_iocs(value: str = Query(..., min_length=2), type: str | None = None) -> dict:
    detected_type = type or detect_ioc_type(value)
    normalized_value = value.lower().strip()
    results = [
        item
        for item in DEMO_IOCS
        if item["value"].lower() == normalized_value and item["type"] == detected_type
    ]

    return {"data": {"query": value, "detected_type": detected_type, "results": results}}
