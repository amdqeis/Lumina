"""002 add email auth and otp codes

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-09-30

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'd4e5f6a7b8c9'
down_revision = '001'
branch_labels = None
depends_on = None



def upgrade() -> None:
    # Make google_id nullable (for local email-only accounts)
    op.alter_column('users', 'google_id', nullable=True)

    # Add new columns to users
    op.add_column('users', sa.Column('email', sa.String(), nullable=True))
    op.add_column('users', sa.Column('password_hash', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('phone', sa.String(), nullable=True))

    # Create unique index on email
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Create otp_codes table
    op.create_table(
        'otp_codes',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('code', sa.String(6), nullable=False),
        sa.Column('purpose', sa.String(32), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_otp_codes_user_id', 'otp_codes', ['user_id'])


def downgrade() -> None:
    op.drop_table('otp_codes')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_column('users', 'phone')
    op.drop_column('users', 'email_verified')
    op.drop_column('users', 'password_hash')
    op.drop_column('users', 'email')
    op.alter_column('users', 'google_id', nullable=False)
