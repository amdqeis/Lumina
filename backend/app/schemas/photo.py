import uuid
from datetime import datetime

from pydantic import BaseModel


class PhotographerSummary(BaseModel):
    username: str | None
    display_name: str | None
    avatar_url: str | None


class ExifData(BaseModel):
    camera_make: str | None = None
    camera_model: str | None = None
    focal_length: str | None = None
    aperture: str | None = None
    iso_speed: int | None = None
    shutter_speed: str | None = None
    width: int | None = None
    height: int | None = None
    taken_at: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class PhotoOut(BaseModel):
    id: uuid.UUID
    drive_file_id: str
    title: str | None
    caption: str | None
    is_public: bool
    thumbnail_url: str | None
    exif_data: ExifData | None
    created_at: datetime
    photographer: PhotographerSummary | None = None

    model_config = {"from_attributes": True}


class PhotoDetailOut(PhotoOut):
    view_url: str | None = None


class PhotoUpdateRequest(BaseModel):
    title: str | None = None
    caption: str | None = None
    is_public: bool | None = None


class SyncRequest(BaseModel):
    folder_id: str


class SyncResult(BaseModel):
    message: str = "Sync completed"
    synced_count: int
    skipped_count: int


class FeedPhoto(BaseModel):
    id: uuid.UUID
    thumbnail_url: str | None
    title: str | None
    photographer: PhotographerSummary


class FeedResponse(BaseModel):
    photos: list[FeedPhoto]
    total: int


class MyPhotosResponse(BaseModel):
    photos: list[PhotoOut]
    total: int
