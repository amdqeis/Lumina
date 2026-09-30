"""OTP code repository — CRUD for email verification & password reset codes."""
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import OTPCode
from app.services.email_service import generate_otp

OTP_EXPIRE_MINUTES = 10


async def create_otp(
    db: AsyncSession,
    user_id: uuid.UUID,
    purpose: str,
) -> str:
    """Generate, store, and return a new 6-digit OTP. Invalidates prior codes for same purpose."""
    # Invalidate old codes for same user + purpose
    await db.execute(
        update(OTPCode)
        .where(OTPCode.user_id == user_id, OTPCode.purpose == purpose, OTPCode.used == False)  # noqa: E712
        .values(used=True)
    )
    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
    otp = OTPCode(user_id=user_id, code=code, purpose=purpose, expires_at=expires_at)
    db.add(otp)
    await db.commit()
    return code


async def verify_otp(
    db: AsyncSession,
    user_id: uuid.UUID,
    code: str,
    purpose: str,
) -> bool:
    """Check the OTP code. Returns True if valid; marks it used."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(OTPCode).where(
            OTPCode.user_id == user_id,
            OTPCode.code == code,
            OTPCode.purpose == purpose,
            OTPCode.used == False,  # noqa: E712
            OTPCode.expires_at > now,
        )
    )
    otp = result.scalar_one_or_none()
    if otp is None:
        return False
    otp.used = True
    await db.commit()
    return True
