# 📐 Lumina — Arsitektur Sistem

> **File:** `docs/01-architecture.md`
> **Last Updated:** 2026-09-29

---

## Overview

Lumina beroperasi sebagai **Cloud Integration Gateway**: backend tidak menyimpan file foto, hanya menyimpan **metadata** dari file yang ada di Google Drive user. Semua gambar di-serve langsung melalui Google Drive embed URL.

Backend menggunakan **Layered Architecture** yang memisahkan tanggung jawab secara tegas:

```
HTTP Request
     │
     ▼
┌──────────────────┐
│  Router (Route)  │  ← Terima request, validasi input, panggil service
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Service       │  ← Business logic, orkestrasi antar-repository & external API
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Repository     │  ← Query database (SQLAlchemy), tidak tahu tentang HTTP
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Database Model  │  ← ORM model (SQLAlchemy), definisi tabel
└──────────────────┘
```

---

## Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, image optimization bawaan |
| Styling | Tailwind CSS | Utility-first, cepat untuk prototyping |
| Backend | FastAPI (Python 3.12) | Auto Swagger, async native, clean code |
| Database | PostgreSQL (Neon) | Serverless, gratis, cloud-native |
| Auth | Google OAuth 2.0 + JWT | Cloud identity provider resmi |
| Drive | Google Drive API v3 | Cloud-to-cloud integration |
| Container | Docker | Portabel, siap deploy ke mana saja |
| Deploy BE | Google Cloud Run | Serverless container, scale-to-zero |
| Deploy FE | Vercel / Cloudflare Pages | Gratis, CDN global |
| DNS + SSL | Cloudflare | Free SSL, proxy protection |

---

## Folder Struktur Backend

```
backend/
├── app/
│   ├── main.py                   ← FastAPI app instance, middleware, router mount
│   ├── config.py                 ← Pydantic Settings (env vars)
│   ├── database.py               ← SQLAlchemy async engine & session factory
│   │
│   ├── models/                   ← SQLAlchemy ORM models (definisi tabel)
│   │   ├── __init__.py
│   │   ├── user.py               ← class User(Base)
│   │   └── photo.py              ← class Photo(Base)
│   │
│   ├── schemas/                  ← Pydantic schemas (request/response DTO)
│   │   ├── __init__.py
│   │   ├── user.py               ← UserOut, UserUpdateRequest, ...
│   │   ├── photo.py              ← PhotoOut, PhotoUpdateRequest, SyncRequest, ...
│   │   └── auth.py               ← GoogleAuthRequest, TokenResponse, ...
│   │
│   ├── repositories/             ← ⭐ Database access layer (CRUD queries)
│   │   ├── __init__.py
│   │   ├── base.py               ← Abstraksi umum (opsional)
│   │   ├── user_repository.py    ← get_by_google_id, upsert, update_profile
│   │   └── photo_repository.py   ← get_by_user, get_by_id, upsert_many, delete, get_public_all
│   │
│   ├── services/                 ← ⭐ Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py       ← exchange_google_code(), generate_jwt(), verify_jwt()
│   │   ├── user_service.py       ← get_profile(), update_profile()
│   │   ├── photo_service.py      ← get_my_photos(), update_photo(), delete_photo()
│   │   ├── drive_service.py      ← list_drive_photos(), sync_folder()
│   │   ├── explore_service.py    ← get_explore_feed() (panggil diverse_shuffle)
│   │   └── shuffle_service.py    ← diverse_weighted_shuffle()
│   │
│   ├── routers/                  ← ⭐ HTTP route layer (FastAPI APIRouter)
│   │   ├── __init__.py
│   │   ├── auth.py               ← POST /auth/google, GET /auth/me
│   │   ├── users.py              ← PATCH /users/profile, GET /users/:username
│   │   ├── explore.py            ← GET /explore/feed
│   │   ├── photos.py             ← GET /photos/:id
│   │   ├── me.py                 ← GET /me/photos, POST /me/sync-drive, PATCH /me/photos/:id, DELETE /me/photos/:id
│   │   └── health.py             ← GET /health
│   │
│   └── dependencies/             ← FastAPI Depends() reusable injections
│       ├── __init__.py
│       ├── auth.py               ← get_current_user() — verifikasi JWT dari header
│       └── db.py                 ← get_db() — inject async database session
│
├── alembic/                      ← Database migration
│   └── versions/
├── alembic.ini
├── Dockerfile
├── requirements.txt
└── .env.example
```

---

## Prinsip Layered Architecture

### Layer 1 — Router (`routers/`)
- **Tanggung jawab:** Menerima HTTP request, validasi input (via Pydantic schema), memanggil service, dan mengembalikan response HTTP yang tepat.
- **Tidak boleh:** Query database langsung, menulis business logic.
- **Contoh:**
```python
# routers/me.py
@router.post("/me/sync-drive", status_code=202)
async def sync_drive(
    body: SyncRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await photo_service.sync_from_drive(db, current_user, body.folder_id)
    return result
```

### Layer 2 — Service (`services/`)
- **Tanggung jawab:** Business logic, orkestrasi — memanggil repository, memanggil external API (Google Drive), transformasi data, dan penerapan rules bisnis.
- **Tidak boleh:** Tahu tentang HTTP request/response secara langsung, tidak langsung query SQLAlchemy session sendiri (delegasikan ke repository).
- **Contoh:**
```python
# services/photo_service.py
async def sync_from_drive(db: AsyncSession, user: User, folder_id: str) -> SyncResult:
    raw_files = await drive_service.list_drive_photos(user.access_token, folder_id)
    photos_to_upsert = [_map_drive_to_photo(f, user.id) for f in raw_files]
    synced, skipped = await photo_repository.upsert_many(db, photos_to_upsert)
    return SyncResult(synced_count=synced, skipped_count=skipped)
```

### Layer 3 — Repository (`repositories/`)
- **Tanggung jawab:** Seluruh query database. Menerima `db: AsyncSession` dan entity data, mengembalikan ORM model atau None.
- **Tidak boleh:** Tahu tentang HTTP, tidak tahu tentang business logic.
- **Contoh:**
```python
# repositories/photo_repository.py
async def upsert_many(db: AsyncSession, photos: list[Photo]) -> tuple[int, int]:
    synced, skipped = 0, 0
    for photo in photos:
        existing = await db.execute(
            select(Photo).where(Photo.drive_file_id == photo.drive_file_id)
        )
        if existing.scalar_one_or_none():
            skipped += 1
        else:
            db.add(photo)
            synced += 1
    await db.commit()
    return synced, skipped
```

### Layer 4 — Model (`models/`)
- **Tanggung jawab:** Definisi struktur tabel di database via SQLAlchemy ORM. Tidak mengandung logika apapun.

---

## Alur Request End-to-End (Contoh: Sync Drive)

```
POST /api/v1/me/sync-drive
     │
     ▼
routers/me.py
  - Parse body → SyncRequest schema (Pydantic)
  - get_current_user() → verifikasi JWT, ambil User object
  - Panggil photo_service.sync_from_drive(db, user, folder_id)
     │
     ▼
services/photo_service.py
  - Panggil drive_service.list_drive_photos(user.access_token, folder_id)
  - Map DriveFile → Photo ORM object
  - Panggil photo_repository.upsert_many(db, photos)
     │
     ├──► services/drive_service.py
     │      - HTTP call ke Google Drive API v3
     │      - Return list[DriveFile]
     │
     └──► repositories/photo_repository.py
            - SELECT existing by drive_file_id
            - INSERT new photos
            - COMMIT
            - Return (synced_count, skipped_count)
     │
     ▼
routers/me.py
  - Return HTTP 202 Accepted + SyncResult JSON
```

---

## System Architecture Flow

```
Browser (Next.js)
    │
    ├─► GET /explore/feed ──────────────────────► FastAPI Backend
    │                                                   │
    ├─► POST /auth/google ─► [Google OAuth 2.0]         │
    │        └─── JWT Token ◄────────────────────────────┤
    │                                                   │
    └─► POST /me/sync-drive ─────────────────────────────┤
                                                        │
                                           ┌────────────▼──────────┐
                                           │  Google Drive API v3  │
                                           └────────────┬──────────┘
                                                        │ file metadata
                                           ┌────────────▼──────────┐
                                           │  Neon PostgreSQL       │
                                           └───────────────────────┘
```

---

## Authentication Flow

1. User klik "Login dengan Google" di frontend
2. Frontend redirect ke Google consent screen
3. Google callback ke frontend dengan `auth_code`
4. Frontend kirim `auth_code` ke `POST /api/v1/auth/google`
5. `routers/auth.py` → panggil `auth_service.exchange_google_code()`
6. `auth_service` tukar code ke Google, ambil user profile, panggil `user_repository.upsert()`
7. `auth_service` generate JWT token, return ke router
8. Frontend simpan JWT di localStorage / httpOnly cookie

---

## Prinsip Desain

1. **Layered Architecture** — Setiap layer punya tanggung jawab tunggal; perubahan di satu layer tidak merusak layer lain
2. **Dependency Injection** — FastAPI `Depends()` menginjeksi `db` session dan `current_user` ke router tanpa global state
3. **Stateless API** — Semua auth lewat JWT, backend tidak menyimpan session
4. **Cloud-to-Cloud** — Backend langsung bicara ke Google Drive API via `drive_service`
5. **File Safety** — Delete dari Lumina hanya hapus record DB, file GDrive tetap aman
6. **Diverse Feed** — `shuffle_service` memastikan tidak ada fotografer yang mendominasi feed
