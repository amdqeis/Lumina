from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import photo_repository
from app.schemas.photo import FeedPhoto, FeedResponse, PhotographerSummary
from app.services import shuffle_service


async def get_feed(db: AsyncSession, session_id: str, limit: int = 30) -> FeedResponse:
    """
    Fetch a curated explore feed using the Diverse Weighted Shuffle algorithm.

    - Retrieves all public photos from the database.
    - Groups by photographer and takes at most 3 per user.
    - Shuffles deterministically based on session_id and today's date.
    - Returns up to `limit` photos.
    """
    all_public = await photo_repository.get_all_public(db)
    shuffled = shuffle_service.diverse_weighted_shuffle(all_public, session_id)
    shuffled = shuffled[:limit]

    feed_items = [
        FeedPhoto(
            id=p.id,
            thumbnail_url=p.thumbnail_url,
            title=p.title,
            photographer=PhotographerSummary(
                username=p.user.username if p.user else None,
                display_name=p.user.display_name if p.user else None,
                avatar_url=p.user.avatar_url if p.user else None,
            ),
        )
        for p in shuffled
    ]
    return FeedResponse(photos=feed_items, total=len(feed_items))
