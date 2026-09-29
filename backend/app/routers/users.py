from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.user import PublicProfileOut, UserOut, UserUpdateRequest
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.patch("/profile", response_model=UserOut, summary="Update current user profile")
async def update_profile(
    body: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the authenticated user's display name, bio, username, instagram, or portfolio link."""
    updated = await user_service.update_profile(db, current_user.id, body)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated


@router.get("/{username}", response_model=PublicProfileOut, summary="Get a photographer's public profile")
async def get_public_profile(username: str, db: AsyncSession = Depends(get_db)):
    """Returns a photographer's public profile and their publicly visible photos."""
    profile = await user_service.get_public_profile(db, username)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return profile
