import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories import otp_repository, user_repository
from app.schemas.auth import (
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    TokenUserOut,
    VerifyOTPRequest,
)
from app.schemas.user import UserOut
from app.services import auth_service
from app.services.email_service import send_otp_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ─── Google OAuth ────────────────────────────────────────────────────────────

@router.post("/google", response_model=TokenResponse, summary="Exchange Google auth code for JWT")
async def google_auth(body: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """
    Accepts the Google OAuth2 auth code from the frontend callback,
    exchanges it for an access token, fetches the user's Google profile,
    upserts the user in the database, and returns a signed JWT.
    """
    try:
        profile = await auth_service.exchange_google_code(body.code, body.redirect_uri)
    except Exception as exc:
        logger.error("Google code exchange failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to exchange Google auth code. Please try again.",
        )

    user = await user_repository.upsert(
        db,
        google_id=profile["google_id"],
        display_name=profile["display_name"],
        avatar_url=profile["avatar_url"],
        google_access_token=profile["access_token"],
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


# ─── Email / password auth ───────────────────────────────────────────────────

@router.post("/register", response_model=MessageResponse, summary="Register with email & password")
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new account. Sends OTP to verify email address."""
    existing = await user_repository.get_by_email(db, body.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    if len(body.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters.",
        )

    password_hash = auth_service.hash_password(body.password)
    user = await user_repository.create_local_user(
        db,
        email=body.email,
        password_hash=password_hash,
        display_name=body.display_name,
    )

    # Send verification OTP
    otp = await otp_repository.create_otp(db, user.id, "verify_email")
    try:
        await send_otp_email(body.email, otp, "verify_email")
    except Exception as exc:
        logger.warning("Failed to send verification email to %s: %s", body.email, exc)

    return MessageResponse(message="Account created. Check your email for a verification code.")


@router.post("/verify-email", response_model=TokenResponse, summary="Verify email with OTP")
async def verify_email(body: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    """Verify email address using OTP. Returns JWT on success."""
    user = await user_repository.get_by_email(db, body.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    valid = await otp_repository.verify_otp(db, user.id, body.code, "verify_email")
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code.",
        )

    user.email_verified = True
    await db.commit()
    await db.refresh(user)

    token = auth_service.generate_jwt(str(user.id))
    return TokenResponse(access_token=token, user=TokenUserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse, summary="Login with email & password")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with email and password. Returns JWT."""
    user = await user_repository.get_by_email(db, body.email)
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not auth_service.verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before logging in.",
        )

    token = auth_service.generate_jwt(str(user.id))
    return TokenResponse(access_token=token, user=TokenUserOut.model_validate(user))


@router.post("/resend-otp", response_model=MessageResponse, summary="Resend email verification OTP")
async def resend_otp(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Resend email verification OTP for unverified accounts."""
    user = await user_repository.get_by_email(db, body.email)
    if not user:
        # Avoid user enumeration — always return 200
        return MessageResponse(message="If this email is registered, you will receive a code.")
    if user.email_verified:
        return MessageResponse(message="Email is already verified.")

    otp = await otp_repository.create_otp(db, user.id, "verify_email")
    try:
        await send_otp_email(body.email, otp, "verify_email")
    except Exception as exc:
        logger.warning("Failed to resend OTP: %s", exc)

    return MessageResponse(message="If this email is registered, you will receive a code.")


@router.post("/forgot-password", response_model=MessageResponse, summary="Request password reset OTP")
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Send a password reset OTP to the given email."""
    user = await user_repository.get_by_email(db, body.email)
    if user and user.password_hash:
        otp = await otp_repository.create_otp(db, user.id, "reset_password")
        try:
            await send_otp_email(body.email, otp, "reset_password")
        except Exception as exc:
            logger.warning("Failed to send password reset email: %s", exc)

    # Always respond 200 to prevent email enumeration
    return MessageResponse(message="If this email is registered, you will receive a reset code.")


@router.post("/reset-password", response_model=TokenResponse, summary="Reset password with OTP")
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset password using the OTP sent to email."""
    user = await user_repository.get_by_email(db, body.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if len(body.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters.",
        )

    valid = await otp_repository.verify_otp(db, user.id, body.code, "reset_password")
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code.",
        )

    user.password_hash = auth_service.hash_password(body.new_password)
    user.email_verified = True  # also mark email verified during reset
    await db.commit()
    await db.refresh(user)

    token = auth_service.generate_jwt(str(user.id))
    return TokenResponse(access_token=token, user=TokenUserOut.model_validate(user))
