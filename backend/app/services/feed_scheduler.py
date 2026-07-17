import logging
from datetime import UTC, datetime

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import settings
from app.db.session import SessionLocal
from app.services.feed_importer import import_cisa_kev_feed, import_free_news_feeds

logger = logging.getLogger(__name__)

SCHEDULER_USER_ID = "system-feed-scheduler"

feed_scheduler = BackgroundScheduler(timezone="UTC")


def import_scheduled_feeds() -> None:
    db = SessionLocal()
    kev_result = {}
    news_result = {}
    try:
        try:
            kev_result = import_cisa_kev_feed(
                db,
                imported_by=SCHEDULER_USER_ID,
                limit=settings.feed_scheduler_cisa_kev_limit,
            )
        except Exception:
            db.rollback()
            logger.exception("Scheduled CISA KEV import failed")

        news_result = import_free_news_feeds(
            db,
            imported_by=SCHEDULER_USER_ID,
            limit_per_source=settings.feed_scheduler_limit_per_source,
        )
        logger.info(
            "Scheduled feed import completed: kev_created=%s news_created=%s failed_sources=%s",
            kev_result.get("created_threats"),
            news_result.get("created_threats"),
            news_result.get("failed_source_count"),
        )
    except Exception:
        db.rollback()
        logger.exception("Scheduled free news feed import failed")
    finally:
        db.close()


def start_feed_scheduler() -> None:
    if not settings.feed_scheduler_enabled:
        logger.info("Feed scheduler is disabled")
        return

    if feed_scheduler.running:
        return

    feed_scheduler.add_job(
        import_scheduled_feeds,
        IntervalTrigger(minutes=settings.feed_scheduler_interval_minutes),
        id="scheduled_feed_import",
        max_instances=1,
        next_run_time=datetime.now(UTC),
        replace_existing=True,
    )
    feed_scheduler.start()
    logger.info(
        "Feed scheduler started: interval_minutes=%s limit_per_source=%s cisa_kev_limit=%s",
        settings.feed_scheduler_interval_minutes,
        settings.feed_scheduler_limit_per_source,
        settings.feed_scheduler_cisa_kev_limit,
    )


def stop_feed_scheduler() -> None:
    if feed_scheduler.running:
        feed_scheduler.shutdown(wait=False)
        logger.info("Feed scheduler stopped")
