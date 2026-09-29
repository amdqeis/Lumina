# 🗄️ Lumina — Database Schema

> **File:** `docs/03-database-schema.md`
> **Database:** PostgreSQL (Neon Serverless)
> **ORM:** SQLAlchemy 2.0 (async)

---

## ER Diagram

```
┌─────────────────────────────────────┐
│              users                  │
├─────────────────────────────────────┤
│ id           UUID (PK)              │
│ google_id    TEXT UNIQUE NOT NULL   │
│ username     TEXT UNIQUE            │
│ display_name TEXT                   │
│ bio          TEXT                   │
│ avatar_url   TEXT                   │
│ instagram    TEXT                   │
│ portfolio    TEXT                   │
│ created_at   TIMESTAMPTZ            │
└───────────────┬─────────────────────┘
                │ 1
                │
                │ N
┌───────────────▼─────────────────────┐
│              photos                 │
├─────────────────────────────────────┤
│ id            UUID (PK)             │
│ user_id       UUID (FK → users.id)  │
│ drive_file_id TEXT UNIQUE NOT NULL  │
│ title         TEXT                  │
│ caption       TEXT                  │
│ is_public     BOOLEAN DEFAULT true  │
│ thumbnail_url TEXT                  │
│ exif_data     JSONB                 │
│ created_at    TIMESTAMPTZ           │
└─────────────────────────────────────┘
```

---

## SQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id     TEXT        UNIQUE NOT NULL,
  username      TEXT        UNIQUE,
  display_name  TEXT,
  bio           TEXT,
  avatar_url    TEXT,
  instagram     TEXT,
  portfolio     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk lookup cepat
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_username  ON users(username);

-- ============================================
-- TABLE: photos
-- ============================================
CREATE TABLE photos (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  drive_file_id  TEXT        UNIQUE NOT NULL,
  title          TEXT,
  caption        TEXT,
  is_public      BOOLEAN     NOT NULL DEFAULT true,
  thumbnail_url  TEXT,
  exif_data      JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk query feed (hanya foto publik, diurutkan terbaru)
CREATE INDEX idx_photos_user_id    ON photos(user_id);
CREATE INDEX idx_photos_is_public  ON photos(is_public) WHERE is_public = true;
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
```

---

## EXIF Data JSON Structure

Field `exif_data` disimpan sebagai JSONB dengan struktur:

```json
{
  "camera_make": "Canon",
  "camera_model": "EOS R5",
  "focal_length": "85.0 mm",
  "aperture": "f/1.8",
  "iso_speed": 400,
  "shutter_speed": "1/500",
  "width": 5472,
  "height": 3648,
  "taken_at": "2026-09-15T17:30:00Z",
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

> **Sumber data:** `imageMediaMetadata` dari Google Drive API v3 — sudah otomatis ter-extract tanpa library tambahan.

---

## SQLAlchemy Models (Python)

```python
# app/models/user.py
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id:           Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    google_id:    Mapped[str]       = mapped_column(String, unique=True, nullable=False)
    username:     Mapped[str | None]= mapped_column(String, unique=True)
    display_name: Mapped[str | None]= mapped_column(Text)
    bio:          Mapped[str | None]= mapped_column(Text)
    avatar_url:   Mapped[str | None]= mapped_column(Text)
    instagram:    Mapped[str | None]= mapped_column(String)
    portfolio:    Mapped[str | None]= mapped_column(Text)
    created_at:   Mapped[datetime]  = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    photos: Mapped[list["Photo"]] = relationship(back_populates="user", cascade="all, delete-orphan")
```

```python
# app/models/photo.py
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Photo(Base):
    __tablename__ = "photos"

    id:            Mapped[uuid.UUID]= mapped_column(primary_key=True, default=uuid.uuid4)
    user_id:       Mapped[uuid.UUID]= mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    drive_file_id: Mapped[str]      = mapped_column(String, unique=True, nullable=False)
    title:         Mapped[str | None]= mapped_column(Text)
    caption:       Mapped[str | None]= mapped_column(Text)
    is_public:     Mapped[bool]     = mapped_column(Boolean, default=True, nullable=False)
    thumbnail_url: Mapped[str | None]= mapped_column(Text)
    exif_data:     Mapped[dict | None]= mapped_column(JSON)
    created_at:    Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship(back_populates="photos")
```

---

## Catatan Migrasi

- Gunakan **Alembic** untuk database migration
- Jangan ubah schema secara manual di Neon console — selalu buat migration file
- Command: `alembic revision --autogenerate -m "description"` lalu `alembic upgrade head`
