import uuid
from datetime import datetime

from pydantic import BaseModel


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
