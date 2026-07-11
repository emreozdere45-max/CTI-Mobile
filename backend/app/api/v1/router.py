from fastapi import APIRouter

from app.api.v1.endpoints import ai, auth, favorites, health, iocs, notifications, threats, users

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(threats.router, prefix="/threats", tags=["threats"])
api_router.include_router(iocs.router, prefix="/iocs", tags=["iocs"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(favorites.router, prefix="/favorites", tags=["favorites"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
