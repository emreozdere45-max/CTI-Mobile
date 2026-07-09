from fastapi import APIRouter

from app.api.v1.endpoints import ai, auth, health, iocs, threats, users

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(threats.router, prefix="/threats", tags=["threats"])
api_router.include_router(iocs.router, prefix="/iocs", tags=["iocs"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
