import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_by_google_id(db: AsyncSession, google_id: str) -> User | None:
    result = await db.execute(select(User).where(User.google_id == google_id))
    return result.scalar_one_or_none()


async def get_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def get_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def upsert(
    db: AsyncSession,
    google_id: str,
    display_name: str | None,
    avatar_url: str | None,
    google_access_token: str | None = None,
) -> User:
    """Create user if not exists, update display_name, avatar_url & access_token if exists."""
    user = await get_by_google_id(db, google_id)
    if user is None:
        user = User(
            google_id=google_id,
            display_name=display_name,
            avatar_url=avatar_url,
            google_access_token=google_access_token,
        )
        db.add(user)
    else:
        if display_name:
            user.display_name = display_name
        if avatar_url:
            user.avatar_url = avatar_url
        if google_access_token:
            user.google_access_token = google_access_token
    await db.commit()
    await db.refresh(user)
    return user


async def update_profile(
    db: AsyncSession,
    user_id: uuid.UUID,
    data: dict,
) -> User | None:
    user = await get_by_id(db, user_id)
    if user is None:
        return None
    for field, value in data.items():
        if value is not None:
            setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user
