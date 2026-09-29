from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, explore, health, me, photos, users

app = FastAPI(
    title="Lumina API",
    description=(
        "Cloud Integration Gateway for Lumina — a photography gallery that connects "
        "Google Drive folders with a public photo feed. "
        "Authenticate via Google OAuth 2.0 to sync and manage your portfolio."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow configured frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers under /api/v1
API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(explore.router, prefix=API_PREFIX)
app.include_router(photos.router, prefix=API_PREFIX)
app.include_router(me.router, prefix=API_PREFIX)
app.include_router(health.router, prefix=API_PREFIX)


@app.get("/", include_in_schema=False)
async def root():
    return {"message": "Lumina API is running. Visit /docs for the interactive API documentation."}
