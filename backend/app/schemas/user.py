import uuid
from datetime import datetime

from pydantic import BaseModel


class UserOut(BaseModel):
    id: uuid.UUID
    google_id: str
    username: str | None
    display_name: str | None
    bio: str | None
    avatar_url: str | None
    instagram: str | None
    portfolio: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    display_name: str | None = None
    username: str | None = None
    bio: str | None = None
    instagram: str | None = None
    portfolio: str | None = None


class PublicPhotoSummary(BaseModel):
    id: uuid.UUID
    thumbnail_url: str | None
    title: str | None

    model_config = {"from_attributes": True}


class PublicProfileOut(BaseModel):
    username: str | None
    display_name: str | None
    bio: str | None
    avatar_url: str | None
    instagram: str | None
    portfolio: str | None
    public_photo_count: int
    photos: list[PublicPhotoSummary]
