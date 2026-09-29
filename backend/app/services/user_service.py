import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import photo_repository, user_repository
from app.schemas.user import PublicPhotoSummary, PublicProfileOut, UserOut, UserUpdateRequest


async def get_public_profile(db: AsyncSession, username: str) -> PublicProfileOut | None:
    user = await user_repository.get_by_username(db, username)
    if user is None:
        return None

    public_photos = await photo_repository.get_by_user(db, user.id)
    public_photos = [p for p in public_photos if p.is_public]

    return PublicProfileOut(
        username=user.username,
        display_name=user.display_name,
        bio=user.bio,
        avatar_url=user.avatar_url,
        instagram=user.instagram,
        portfolio=user.portfolio,
        public_photo_count=len(public_photos),
        photos=[
            PublicPhotoSummary(id=p.id, thumbnail_url=p.thumbnail_url, title=p.title)
            for p in public_photos
        ],
    )


async def update_profile(
    db: AsyncSession, user_id: uuid.UUID, data: UserUpdateRequest
) -> UserOut | None:
    update_dict = data.model_dump(exclude_none=True)
    user = await user_repository.update_profile(db, user_id, update_dict)
    if user is None:
        return None
    return UserOut.model_validate(user)
