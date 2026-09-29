"""initial_schema

Revision ID: 001
Revises:
Create Date: 2026-09-29

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- users table ---
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("google_id", sa.String(), nullable=False),
        sa.Column("username", sa.String(), nullable=True),
        sa.Column("display_name", sa.Text(), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column("instagram", sa.String(), nullable=True),
        sa.Column("portfolio", sa.Text(), nullable=True),
        sa.Column("google_access_token", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_google_id"), "users", ["google_id"], unique=True)
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)

    # --- photos table ---
    op.create_table(
        "photos",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("drive_file_id", sa.String(), nullable=False),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("caption", sa.Text(), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False),
        sa.Column("thumbnail_url", sa.Text(), nullable=True),
        sa.Column("exif_data", sa.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("drive_file_id"),
    )
    op.create_index(op.f("ix_photos_user_id"), "photos", ["user_id"], unique=False)
    op.create_index(op.f("ix_photos_is_public"), "photos", ["is_public"], unique=False)
    op.create_index(op.f("ix_photos_created_at"), "photos", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_photos_created_at"), table_name="photos")
    op.drop_index(op.f("ix_photos_is_public"), table_name="photos")
    op.drop_index(op.f("ix_photos_user_id"), table_name="photos")
    op.drop_table("photos")
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_index(op.f("ix_users_google_id"), table_name="users")
    op.drop_table("users")
