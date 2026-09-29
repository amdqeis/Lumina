# 📸 Lumina

> Galeri fotografi publik yang menghubungkan Google Drive dengan feed foto publik via Cloud Integration Gateway.

## Tech Stack
- **Backend**: Python FastAPI + async SQLAlchemy + Alembic
- **Database**: PostgreSQL (Neon/Supabase)
- **Auth**: Google OAuth 2.0 + JWT
- **Cloud**: Google Drive API v3
- **Frontend**: Next.js + Tailwind CSS *(Minggu 3)*
- **Deploy**: Google Cloud Run + Vercel

## Quick Start (Backend)

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Buat .env dari template
cp .env.example .env
# Edit .env dengan kredensial Google Cloud, Neon DB, dan JWT secret

# Jalankan database migration
alembic upgrade head

# Jalankan dev server
uvicorn app.main:app --reload
```

Buka **http://localhost:8000/docs** untuk Swagger UI.

## API Endpoints (11 total)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/v1/auth/google` | Exchange Google auth code → JWT |
| `GET` | `/api/v1/auth/me` | Profil user yang login |
| `PATCH` | `/api/v1/users/profile` | Update bio, username, dll |
| `GET` | `/api/v1/users/{username}` | Profil publik fotografer |
| `GET` | `/api/v1/explore/feed` | Feed foto acak (Diverse Shuffle) |
| `GET` | `/api/v1/photos/{id}` | Detail foto + EXIF |
| `GET` | `/api/v1/me/photos` | Semua foto milik sendiri |
| `POST` | `/api/v1/me/sync-drive` | Sinkron dari folder Google Drive |
| `PATCH` | `/api/v1/me/photos/{id}` | Update caption/visibilitas |
| `DELETE` | `/api/v1/me/photos/{id}` | Hapus foto (Drive aman) |
| `GET` | `/api/v1/health` | Health check DB + Google API |

## Folder Structure (Backend)

```
backend/app/
  config.py          # Pydantic Settings (env vars)
  database.py        # Async SQLAlchemy engine + session
  main.py            # FastAPI app + CORS + router mounts
  models/            # ORM models (User, Photo)
  schemas/           # Pydantic DTOs (request/response)
  repositories/      # Database access layer
  services/          # Business logic
  routers/           # HTTP endpoints
  dependencies/      # FastAPI Depends (auth, db)
```
