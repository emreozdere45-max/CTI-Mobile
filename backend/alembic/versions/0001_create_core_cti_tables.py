"""create core cti tables

Revision ID: 0001_create_core_cti_tables
Revises:
Create Date: 2026-07-07
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001_create_core_cti_tables"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "sources",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("source_type", sa.String(length=64), nullable=False),
        sa.Column("trust_score", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("source_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sources_is_active"), "sources", ["is_active"], unique=False)
    op.create_index(op.f("ix_sources_source_type"), "sources", ["source_type"], unique=False)

    op.create_table(
        "iocs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("type", sa.String(length=32), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("normalized_value", sa.Text(), nullable=False),
        sa.Column("risk_score", sa.Integer(), nullable=False),
        sa.Column("confidence_score", sa.Integer(), nullable=False),
        sa.Column("first_seen_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ioc_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("type", "normalized_value", name="uq_iocs_type_normalized_value"),
    )
    op.create_index(op.f("ix_iocs_risk_score"), "iocs", ["risk_score"], unique=False)
    op.create_index(op.f("ix_iocs_type"), "iocs", ["type"], unique=False)

    op.create_table(
        "threats",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("severity", sa.String(length=32), nullable=False),
        sa.Column("confidence_score", sa.Integer(), nullable=False),
        sa.Column("industry", sa.String(length=128), nullable=True),
        sa.Column("region", sa.String(length=128), nullable=True),
        sa.Column("tags", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("first_seen_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("raw_data", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["source_id"], ["sources.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_threats_industry"), "threats", ["industry"], unique=False)
    op.create_index(op.f("ix_threats_published_at"), "threats", ["published_at"], unique=False)
    op.create_index(op.f("ix_threats_severity"), "threats", ["severity"], unique=False)
    op.create_index("ix_threats_tags", "threats", ["tags"], unique=False, postgresql_using="gin")

    op.create_table(
        "threat_iocs",
        sa.Column("threat_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ioc_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("relationship_type", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["ioc_id"], ["iocs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["threat_id"], ["threats.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("threat_id", "ioc_id"),
        sa.UniqueConstraint("threat_id", "ioc_id", name="uq_threat_iocs_threat_id_ioc_id"),
    )


def downgrade() -> None:
    op.drop_table("threat_iocs")
    op.drop_index("ix_threats_tags", table_name="threats", postgresql_using="gin")
    op.drop_index(op.f("ix_threats_severity"), table_name="threats")
    op.drop_index(op.f("ix_threats_published_at"), table_name="threats")
    op.drop_index(op.f("ix_threats_industry"), table_name="threats")
    op.drop_table("threats")
    op.drop_index(op.f("ix_iocs_type"), table_name="iocs")
    op.drop_index(op.f("ix_iocs_risk_score"), table_name="iocs")
    op.drop_table("iocs")
    op.drop_index(op.f("ix_sources_source_type"), table_name="sources")
    op.drop_index(op.f("ix_sources_is_active"), table_name="sources")
    op.drop_table("sources")
