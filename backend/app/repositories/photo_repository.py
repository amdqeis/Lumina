import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.photo import Photo


async def get_by_id(db: AsyncSession, photo_id: uuid.UUID) -> Photo | None:
    result = await db.execute(select(Photo).where(Photo.id == photo_id))
    return result.scalar_one_or_none()


async def get_by_drive_file_id(db: AsyncSession, drive_file_id: str) -> Photo | None:
    result = await db.execute(select(Photo).where(Photo.drive_file_id == drive_file_id))
    return result.scalar_one_or_none()


async def get_by_user(db: AsyncSession, user_id: uuid.UUID) -> list[Photo]:
    result = await db.execute(
        select(Photo)
        .where(Photo.user_id == user_id)
        .order_by(Photo.created_at.desc())
    )
    return list(result.scalars().all())


async def get_all_public(db: AsyncSession) -> list[Photo]:
    result = await db.execute(
        select(Photo)
        .where(Photo.is_public == True)  # noqa: E712
        .order_by(Photo.created_at.desc())
    )
    return list(result.scalars().all())


async def upsert_many(
    db: AsyncSession, photos: list[Photo]
) -> tuple[int, int]:
    """Insert new photos, skip duplicates by drive_file_id. Returns (synced, skipped)."""
    synced, skipped = 0, 0
    for photo in photos:
        existing = await get_by_drive_file_id(db, photo.drive_file_id)
        if existing is not None:
            skipped += 1
        else:
            db.add(photo)
            synced += 1
    await db.commit()
    return synced, skipped


async def update(
    db: AsyncSession,
    photo_id: uuid.UUID,
    user_id: uuid.UUID,
    data: dict,
) -> Photo | None:
    result = await db.execute(
        select(Photo).where(Photo.id == photo_id, Photo.user_id == user_id)
    )
    photo = result.scalar_one_or_none()
    if photo is None:
        return None
    for field, value in data.items():
        if value is not None:
            setattr(photo, field, value)
    await db.commit()
    await db.refresh(photo)
    return photo


async def delete(
    db: AsyncSession, photo_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    result = await db.execute(
        select(Photo).where(Photo.id == photo_id, Photo.user_id == user_id)
    )
    photo = result.scalar_one_or_none()
    if photo is None:
        return False
    await db.delete(photo)
    await db.commit()
    return True
