from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.photo import FeedResponse
from app.services import explore_service

router = APIRouter(prefix="/explore", tags=["Explore"])


@router.get("/feed", response_model=FeedResponse, summary="Get curated explore feed (Diverse Shuffle)")
async def get_feed(
    session_id: str = Query(default="anonymous", description="Client session ID used as shuffle seed"),
    limit: int = Query(default=30, ge=1, le=100, description="Max number of photos to return"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns a curated feed of public photos using the Diverse Weighted Shuffle algorithm:
    - At most 3 photos per photographer are included
    - Order is randomized per session_id and resets daily
    """
    return await explore_service.get_feed(db, session_id=session_id, limit=limit)
