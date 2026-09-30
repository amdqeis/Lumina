import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class GoogleAuthRequest(BaseModel):
    code: str
    redirect_uri: str


class TokenUserOut(BaseModel):
    id: uuid.UUID
    display_name: str | None
    username: str | None
    avatar_url: str | None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: TokenUserOut


# ─── Email / password auth ──────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code: str
    purpose: str = "verify_email"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str


class MessageResponse(BaseModel):
    message: str
