from datetime import datetime, timedelta, timezone
import logging

import httpx
from jose import JWTError, jwt

from app.config import settings

logger = logging.getLogger(__name__)

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


async def exchange_google_code(code: str, redirect_uri: str) -> dict:
    """Exchange Google auth code for user profile info.

    Args:
        code: The OAuth2 authorization code received from Google.
        redirect_uri: Must exactly match the redirect_uri used when initiating
            the OAuth flow on the frontend. Google validates this value.
    """
    logger.info("Exchanging Google code, redirect_uri=%r", redirect_uri)

    async with httpx.AsyncClient(trust_env=False) as client:
        # Step 1: exchange code for tokens
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if not token_resp.is_success:
            logger.error(
                "Google token exchange failed [%d]: %s",
                token_resp.status_code,
                token_resp.text,
            )
        token_resp.raise_for_status()
        token_data = token_resp.json()
        access_token = token_data["access_token"]

        # Step 2: fetch user profile
        profile_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        profile_resp.raise_for_status()
        profile = profile_resp.json()

    return {
        "google_id": profile["id"],
        "display_name": profile.get("name"),
        "avatar_url": profile.get("picture"),
        "email": profile.get("email"),
        "access_token": access_token,
    }


def generate_jwt(user_id: str) -> str:
    """Generate a signed JWT for the given user_id."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_jwt(token: str) -> dict:
    """Decode and verify a JWT. Raises ValueError on failure."""
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}") from e


# ─── Password hashing ────────────────────────────────────────────────────────

from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    return _pwd_context.verify(plain, hashed)
