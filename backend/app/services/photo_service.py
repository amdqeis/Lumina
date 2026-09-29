import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.photo import Photo
from app.repositories import photo_repository
from app.schemas.photo import (
    ExifData,
    FeedPhoto,
    FeedResponse,
    MyPhotosResponse,
    PhotoDetailOut,
    PhotoOut,
    PhotoUpdateRequest,
    PhotographerSummary,
)
from app.services import shuffle_service


def _to_photographer(user) -> PhotographerSummary:
    return PhotographerSummary(
        username=user.username,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
    )


def _to_photo_out(photo: Photo) -> PhotoOut:
    exif = ExifData(**photo.exif_data) if photo.exif_data else None
    photographer = _to_photographer(photo.user) if photo.user else None
    return PhotoOut(
        id=photo.id,
        drive_file_id=photo.drive_file_id,
        title=photo.title,
        caption=photo.caption,
        is_public=photo.is_public,
        thumbnail_url=photo.thumbnail_url,
        exif_data=exif,
        created_at=photo.created_at,
        photographer=photographer,
    )


async def get_my_photos(db: AsyncSession, user_id: uuid.UUID) -> MyPhotosResponse:
    photos = await photo_repository.get_by_user(db, user_id)
    items = [_to_photo_out(p) for p in photos]
    return MyPhotosResponse(photos=items, total=len(items))


async def get_photo_detail(db: AsyncSession, photo_id: uuid.UUID) -> PhotoDetailOut | None:
    photo = await photo_repository.get_by_id(db, photo_id)
    if photo is None or not photo.is_public:
        return None
    exif = ExifData(**photo.exif_data) if photo.exif_data else None
    photographer = _to_photographer(photo.user) if photo.user else None
    view_url = f"https://drive.google.com/file/d/{photo.drive_file_id}/view"
    return PhotoDetailOut(
        id=photo.id,
        drive_file_id=photo.drive_file_id,
        title=photo.title,
        caption=photo.caption,
        is_public=photo.is_public,
        thumbnail_url=photo.thumbnail_url,
        exif_data=exif,
        created_at=photo.created_at,
        photographer=photographer,
        view_url=view_url,
    )


async def update_photo(
    db: AsyncSession,
    photo_id: uuid.UUID,
    user_id: uuid.UUID,
    data: PhotoUpdateRequest,
) -> PhotoOut | None:
    update_dict = data.model_dump(exclude_none=True)
    photo = await photo_repository.update(db, photo_id, user_id, update_dict)
    if photo is None:
        return None
    return _to_photo_out(photo)


async def delete_photo(
    db: AsyncSession, photo_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    return await photo_repository.delete(db, photo_id, user_id)


async def get_explore_feed(
    db: AsyncSession, session_id: str, limit: int = 30
) -> FeedResponse:
    all_public = await photo_repository.get_all_public(db)
    shuffled = shuffle_service.diverse_weighted_shuffle(all_public, session_id)
    shuffled = shuffled[:limit]

    feed_items = [
        FeedPhoto(
            id=p.id,
            thumbnail_url=p.thumbnail_url,
            title=p.title,
            photographer=_to_photographer(p.user) if p.user else PhotographerSummary(
                username=None, display_name=None, avatar_url=None
            ),
        )
        for p in shuffled
    ]
    return FeedResponse(photos=feed_items, total=len(feed_items))
