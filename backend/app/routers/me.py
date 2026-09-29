import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.photo import (
    MyPhotosResponse,
    PhotoOut,
    PhotoUpdateRequest,
    SyncRequest,
    SyncResult,
)
from app.services import photo_service

router = APIRouter(prefix="/me", tags=["My Gallery"])


@router.get("/photos", response_model=MyPhotosResponse, summary="Get all my photos (public + private)")
async def get_my_photos(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns all photos belonging to the authenticated user, including private ones."""
    return await photo_service.get_my_photos(db, current_user.id)


@router.post(
    "/sync-drive",
    response_model=SyncResult,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Sync photos from a Google Drive folder",
)
async def sync_drive(
    body: SyncRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Reads all image files from the given Google Drive folder using the user's
    delegated access token (extracted from the Authorization header).
    New photos are inserted; duplicates (same drive_file_id) are skipped.
    Original files on Google Drive are never modified.
    """
    # Extract the raw Bearer token to pass to Drive API as the user's access token
    auth_header = request.headers.get("Authorization", "")
    access_token = auth_header.removeprefix("Bearer ").strip()

    from app.services.drive_service import list_drive_photos
    from app.models.photo import Photo
    from app.repositories import photo_repository

    try:
        drive_files = await list_drive_photos(access_token, body.folder_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read Google Drive folder: {str(e)}",
        )

    photos_to_insert = [
        Photo(
            user_id=current_user.id,
            drive_file_id=f.file_id,
            title=f.name,
            thumbnail_url=f.thumbnail_url,
            exif_data=f.exif,
            is_public=True,
        )
        for f in drive_files
    ]

    synced, skipped = await photo_repository.upsert_many(db, photos_to_insert)
    return SyncResult(synced_count=synced, skipped_count=skipped)


@router.patch(
    "/photos/{photo_id}",
    response_model=PhotoOut,
    summary="Update photo caption or visibility",
)
async def update_photo(
    photo_id: uuid.UUID,
    body: PhotoUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the title, caption, or public/private status of one of your photos."""
    photo = await photo_service.update_photo(db, photo_id, current_user.id, body)
    if photo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")
    return photo


@router.delete(
    "/photos/{photo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a photo from Lumina (Google Drive file is NOT deleted)",
)
async def delete_photo(
    photo_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Deletes the photo record from the Lumina database only.
    The original file on Google Drive remains untouched.
    """
    deleted = await photo_service.delete_photo(db, photo_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")
