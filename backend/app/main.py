from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import settings
from app.services.feed_scheduler import start_feed_scheduler, stop_feed_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_feed_scheduler()
    try:
        yield
    finally:
        stop_feed_scheduler()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Mobile Cyber Threat Intelligence API",
    lifespan=lifespan,
)

app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health")
def root_health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}
