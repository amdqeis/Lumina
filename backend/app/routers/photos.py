import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.photo import PhotoDetailOut

from app.services import photo_service

router = APIRouter(prefix="/photos", tags=["Photos"])


@router.get("/{photo_id}", response_model=PhotoDetailOut, summary="Get photo detail with EXIF data")
async def get_photo(photo_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Returns full detail for a single public photo, including EXIF camera metadata
    and a link to view the original file on Google Drive.
    """
    photo = await photo_service.get_photo_detail(db, photo_id)
    if photo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")
    return photo
