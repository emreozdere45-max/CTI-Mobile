"""create ai summaries

Revision ID: 0003_create_ai_summaries
Revises: 0002_create_auth_tables
Create Date: 2026-07-09
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0003_create_ai_summaries"
down_revision: str | None = "0002_create_auth_tables"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "ai_summaries",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("threat_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("summary_type", sa.String(length=32), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("model", sa.String(length=128), nullable=False),
        sa.Column("prompt_version", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["threat_id"], ["threats.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_ai_summaries_summary_type"), "ai_summaries", ["summary_type"], unique=False)
    op.create_index(op.f("ix_ai_summaries_threat_id"), "ai_summaries", ["threat_id"], unique=False)
    op.create_index(op.f("ix_ai_summaries_user_id"), "ai_summaries", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_ai_summaries_user_id"), table_name="ai_summaries")
    op.drop_index(op.f("ix_ai_summaries_threat_id"), table_name="ai_summaries")
    op.drop_index(op.f("ix_ai_summaries_summary_type"), table_name="ai_summaries")
    op.drop_table("ai_summaries")
