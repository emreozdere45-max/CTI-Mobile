import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ThreatIOC(Base):
    __tablename__ = "threat_iocs"
    __table_args__ = (UniqueConstraint("threat_id", "ioc_id", name="uq_threat_iocs_threat_id_ioc_id"),)

    threat_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("threats.id", ondelete="CASCADE"),
        primary_key=True,
    )
    ioc_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("iocs.id", ondelete="CASCADE"),
        primary_key=True,
    )
    relationship_type: Mapped[str] = mapped_column(String(64), nullable=False, default="observed")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    threat: Mapped["Threat"] = relationship(back_populates="threat_iocs")
    ioc: Mapped["IOC"] = relationship(back_populates="threat_iocs")
