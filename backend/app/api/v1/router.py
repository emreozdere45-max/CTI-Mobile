from fastapi import APIRouter

from app.api.v1.endpoints import health, iocs, threats

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(threats.router, prefix="/threats", tags=["threats"])
api_router.include_router(iocs.router, prefix="/iocs", tags=["iocs"])
