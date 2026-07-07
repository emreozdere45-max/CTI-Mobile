import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.threat import Threat
    from app.models.threat_ioc import ThreatIOC


class IOC(TimestampMixin, Base):
    __tablename__ = "iocs"
    __table_args__ = (UniqueConstraint("type", "normalized_value", name="uq_iocs_type_normalized_value"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_value: Mapped[str] = mapped_column(Text, nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0, index=True)
    confidence_score: Mapped[int] = mapped_column(Integer, nullable=False, default=50)
    first_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ioc_metadata: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)

    threat_iocs: Mapped[list["ThreatIOC"]] = relationship(back_populates="ioc", cascade="all, delete-orphan")
    threats: Mapped[list["Threat"]] = relationship(secondary="threat_iocs", back_populates="iocs", viewonly=True)
