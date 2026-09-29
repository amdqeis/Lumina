from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories import user_repository
from app.schemas.auth import GoogleAuthRequest, TokenResponse, TokenUserOut
from app.schemas.user import UserOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/google", response_model=TokenResponse, summary="Exchange Google auth code for JWT")
async def google_auth(body: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """
    Accepts the Google OAuth2 auth code from the frontend callback,
    exchanges it for an access token, fetches the user's Google profile,
    upserts the user in the database, and returns a signed JWT.
    """
    try:
        profile = await auth_service.exchange_google_code(body.code, body.redirect_uri)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to exchange Google auth code. Please try again.",
        )

    user = await user_repository.upsert(
        db,
        google_id=profile["google_id"],
        display_name=profile["display_name"],
        avatar_url=profile["avatar_url"],
    )

    token = auth_service.generate_jwt(str(user.id))
    return TokenResponse(
        access_token=token,
        user=TokenUserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut, summary="Get current authenticated user")
async def get_me(current_user: User = Depends(get_current_user)):
    """Returns the full profile of the currently authenticated user."""
    return UserOut.model_validate(current_user)
