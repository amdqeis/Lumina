import random
from collections import defaultdict
from datetime import date

from app.models.photo import Photo


def diverse_weighted_shuffle(photos: list[Photo], session_seed: str) -> list[Photo]:
    """
    Implements the Diverse Weighted Shuffle algorithm:
    1. Group photos by photographer (user_id)
    2. Take at most 3 latest photos per photographer → build candidate pool
    3. Deterministically shuffle the pool using (session_seed + today's date) as seed

    This prevents any single photographer from dominating the feed.
    """
    # Group by user_id, sorted newest-first
    grouped: dict = defaultdict(list)
    for photo in sorted(photos, key=lambda p: p.created_at, reverse=True):
        grouped[photo.user_id].append(photo)

    # Build pool: max 3 per photographer
    pool: list[Photo] = []
    for user_photos in grouped.values():
        pool.extend(user_photos[:3])

    # Deterministic shuffle — same seed within same day gives same order
    seed = hash(f"{session_seed}:{date.today().isoformat()}")
    rng = random.Random(seed)
    rng.shuffle(pool)

    return pool
