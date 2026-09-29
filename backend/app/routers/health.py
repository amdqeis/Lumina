from datetime import datetime, timezone

import httpx
from fastapi import APIRouter
from sqlalchemy import text

from app.database import AsyncSessionLocal

router = APIRouter(prefix="/health", tags=["Monitoring"])

GOOGLE_PING_URL = "https://www.googleapis.com/discovery/v1/apis"


@router.get("", summary="Health check — database and Google API connectivity")
async def health_check():
    """
    Returns the operational status of:
    - The PostgreSQL database connection
    - Google API reachability
    """
    db_status = "disconnected"
    google_status = "unreachable"

    # Check database
    try:
        async with AsyncSessionLocal() as db:
            await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        pass

    # Check Google API reachability
    try:
        async with httpx.AsyncClient(timeout=5.0, trust_env=False) as client:
            resp = await client.get(GOOGLE_PING_URL)
            if resp.status_code == 200:
                google_status = "reachable"
    except Exception:
        pass

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "database": db_status,
        "google_api": google_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
