# 🗓️ Lumina — Sprint Breakdown & Task Checklist

> **File:** `docs/04-sprint-breakdown.md`
> **Durasi Total:** 4 Minggu
> **Update checklist ini setiap subtask selesai!**

---

## Minggu 1 — Cloud Setup, Foundation & Auth
**Target:** Auth flow berjalan end-to-end, database siap, struktur layered architecture terbentuk

### 1.1 Project Setup & Folder Struktur
- [ ] Buat folder `Lumina/backend/` dan `Lumina/frontend/`
- [ ] Init Python virtual env: `python -m venv venv && source venv/bin/activate`
- [ ] Buat `requirements.txt` dan install dependencies
- [ ] Buat folder struktur layered architecture:
  ```
  backend/app/
    models/
    schemas/
    repositories/
    services/
    routers/
    dependencies/
  ```
- [ ] Buat file `.env` dari `.env.example`

### 1.2 Google Cloud Console
- [ ] Buat project baru di [console.cloud.google.com](https://console.cloud.google.com)
- [ ] Aktifkan **Google Drive API v3**
- [ ] Buat **OAuth 2.0 Client ID** (tipe: Web Application)
- [ ] Set Authorized redirect URIs: `http://localhost:3000/auth/callback`
- [ ] Simpan `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` ke `.env`

### 1.3 Database Setup
- [ ] Buat akun di [neon.tech](https://neon.tech) dan buat database `lumina_db`
- [ ] Jalankan SQL schema dari `docs/03-database-schema.md`
- [ ] Simpan `DATABASE_URL` ke `.env`
- [ ] Test koneksi: `python -c "from app.database import engine; print('OK')"`

### 1.4 Foundation — Config, Database, Main
- [ ] Buat `app/config.py` — Pydantic Settings (baca semua env vars)
- [ ] Buat `app/database.py` — async SQLAlchemy engine + `AsyncSession` factory
- [ ] Buat `app/main.py` — FastAPI instance, CORS middleware, mount semua router

### 1.5 Layer: Models (ORM)
- [ ] Buat `app/models/__init__.py`
- [ ] Buat `app/models/user.py` — class `User(Base)`: id, google_id, username, display_name, bio, avatar_url, instagram, portfolio, created_at
- [ ] Buat `app/models/photo.py` — class `Photo(Base)`: id, user_id (FK), drive_file_id, title, caption, is_public, thumbnail_url, exif_data (JSONB), created_at

### 1.6 Layer: Schemas (Pydantic DTO)
- [ ] Buat `app/schemas/auth.py` — `GoogleAuthRequest`, `TokenResponse`
- [ ] Buat `app/schemas/user.py` — `UserOut`, `UserUpdateRequest`, `PublicProfileOut`
- [ ] Buat `app/schemas/photo.py` — `PhotoOut`, `PhotoUpdateRequest`, `SyncRequest`, `SyncResult`

### 1.7 Layer: Repository (Database Access)
- [ ] Buat `app/repositories/__init__.py`
- [ ] Buat `app/repositories/user_repository.py`:
  - [ ] `get_by_google_id(db, google_id) → User | None`
  - [ ] `get_by_username(db, username) → User | None`
  - [ ] `upsert(db, google_id, profile_data) → User`
  - [ ] `update_profile(db, user_id, data) → User`
- [ ] Buat `app/repositories/photo_repository.py`:
  - [ ] `get_by_id(db, photo_id) → Photo | None`
  - [ ] `get_by_user(db, user_id) → list[Photo]`
  - [ ] `get_all_public(db) → list[Photo]`
  - [ ] `upsert_many(db, photos) → tuple[int, int]` (synced, skipped)
  - [ ] `update(db, photo_id, user_id, data) → Photo`
  - [ ] `delete(db, photo_id, user_id) → bool`

### 1.8 Layer: Dependencies (FastAPI Depends)
- [ ] Buat `app/dependencies/db.py` — `get_db()`: async generator inject `AsyncSession`
- [ ] Buat `app/dependencies/auth.py` — `get_current_user()`: extract & verify JWT dari `Authorization: Bearer` header, return `User`

### 1.9 Layer: Auth Service & Router
- [ ] Buat `app/services/auth_service.py`:
  - [ ] `exchange_google_code(code, redirect_uri) → GoogleUserInfo`
  - [ ] `generate_jwt(user_id) → str`
  - [ ] `verify_jwt(token) → dict` (raise 401 jika invalid)
- [ ] Buat `app/routers/auth.py`:
  - [ ] `POST /auth/google` → panggil `auth_service.exchange_google_code()` → `user_repository.upsert()` → `auth_service.generate_jwt()` → return `TokenResponse`
  - [ ] `GET /auth/me` → protected, return user dari `get_current_user()`
- [ ] Buat `app/routers/health.py` — `GET /health` → cek koneksi DB & ping Google API

### 1.10 Verifikasi Minggu 1
- [ ] Buka `http://localhost:8000/docs` → Swagger muncul dengan semua endpoint terdaftar
- [ ] Test `POST /auth/google` dengan Postman → dapat JWT
- [ ] Test `GET /auth/me` dengan JWT → dapat data user
- [ ] Test `GET /health` → semua status "connected" / "reachable"

---

## Minggu 2 — Google Drive Integration, CRUD & Explore Feed
**Target:** Sync Drive berjalan, semua 11 API endpoint tersedia

### 2.1 Layer: Drive Service
- [ ] Buat `app/services/drive_service.py`:
  - [ ] `list_drive_photos(access_token: str, folder_id: str) → list[DriveFile]`
    - [ ] HTTP call ke Google Drive API v3: `GET /files?q='{folder_id}' in parents`
    - [ ] Filter hanya `mimeType` yang dimulai dengan `image/`
    - [ ] Extract `imageMediaMetadata` (EXIF: kamera, ISO, aperture, dll)
    - [ ] Return list `DriveFile` objects (dataclass/Pydantic)

### 2.2 Layer: Photo Service
- [ ] Buat `app/services/photo_service.py`:
  - [ ] `sync_from_drive(db, user, folder_id) → SyncResult`
    - [ ] Panggil `drive_service.list_drive_photos()`
    - [ ] Map `DriveFile` → `Photo` model object
    - [ ] Panggil `photo_repository.upsert_many()`
    - [ ] Return `SyncResult`
  - [ ] `get_my_photos(db, user_id) → list[PhotoOut]`
  - [ ] `get_photo_detail(db, photo_id) → PhotoOut`
  - [ ] `update_photo(db, photo_id, user_id, data) → PhotoOut`
  - [ ] `delete_photo(db, photo_id, user_id) → None`

### 2.3 Layer: User Service
- [ ] Buat `app/services/user_service.py`:
  - [ ] `get_public_profile(db, username) → PublicProfileOut`
  - [ ] `update_profile(db, user_id, data) → UserOut`

### 2.4 Layer: Shuffle Service (Diverse Weighted Shuffle)
- [ ] Buat `app/services/shuffle_service.py`:
  - [ ] `diverse_weighted_shuffle(photos, session_seed) → list[Photo]`
    1. Group foto by `user_id`
    2. Ambil max 3 foto terbaru per user → kumpulkan ke `pool`
    3. `random.seed(hash(session_seed + str(date.today())))`
    4. `random.shuffle(pool)` dan return
- [ ] Buat `app/services/explore_service.py`:
  - [ ] `get_feed(db, session_id) → list[PhotoOut]`
    - [ ] Panggil `photo_repository.get_all_public()`
    - [ ] Panggil `shuffle_service.diverse_weighted_shuffle()`
    - [ ] Return hasil shuffle

### 2.5 Layer: Routers (semua endpoint)
- [ ] Buat `app/routers/me.py`:
  - [ ] `GET /me/photos` → `photo_service.get_my_photos()`
  - [ ] `POST /me/sync-drive` → `photo_service.sync_from_drive()`
  - [ ] `PATCH /me/photos/{id}` → `photo_service.update_photo()`
  - [ ] `DELETE /me/photos/{id}` → `photo_service.delete_photo()`
- [ ] Buat `app/routers/photos.py`:
  - [ ] `GET /photos/{id}` → `photo_service.get_photo_detail()`
- [ ] Buat `app/routers/users.py`:
  - [ ] `PATCH /users/profile` → `user_service.update_profile()`
  - [ ] `GET /users/{username}` → `user_service.get_public_profile()`
- [ ] Buat `app/routers/explore.py`:
  - [ ] `GET /explore/feed` → `explore_service.get_feed()`
- [ ] Daftarkan semua router di `app/main.py`

### 2.6 Verifikasi Minggu 2
- [ ] Test sync Drive dengan folder real → foto muncul di `GET /me/photos`
- [ ] Test EXIF data ter-extract dengan benar di `GET /photos/{id}`
- [ ] Test `GET /explore/feed` → refresh → urutan foto berubah (shuffle bekerja)
- [ ] Test `PATCH /me/photos/{id}` toggle `is_public=false` → foto hilang dari feed publik
- [ ] Test `DELETE /me/photos/{id}` → response 204, file Google Drive tetap ada
- [ ] Swagger `/docs` menampilkan semua 11 endpoint lengkap dengan schema

---

## Minggu 3 — Frontend
**Target:** UI berjalan, semua halaman terhubung ke backend

### 3.1 Next.js Setup
- [ ] Init project: `npx create-next-app@latest frontend --typescript --tailwind --app`
- [ ] Buat `lib/api.ts` — axios/fetch client dengan JWT interceptor
- [ ] Setup env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### 3.2 Landing Page
- [ ] Buat `app/page.tsx` — hero banner fullscreen
- [ ] Komponen `HeroSection` dengan gradient background
- [ ] Tombol "Jelajahi Galeri" → link ke `/explore`
- [ ] Tombol "Login dengan Google" → redirect OAuth

### 3.3 Auth Flow Frontend
- [ ] Setup Google OAuth redirect: `accounts.google.com/o/oauth2/auth`
- [ ] Buat `app/auth/callback/page.tsx` — tangkap `code` dari URL
- [ ] Exchange code ke backend `POST /auth/google`
- [ ] Simpan JWT di localStorage (atau httpOnly cookie via Next.js API route)
- [ ] Context/Store untuk state user yang login

### 3.4 Explore Page
- [ ] Buat `app/explore/page.tsx`
- [ ] Masonry grid dengan CSS `columns` atau `react-masonry-css`
- [ ] Komponen `PhotoCard` — thumbnail, hover overlay nama fotografer
- [ ] Infinite scroll atau pagination
- [ ] Loading skeleton saat fetch

### 3.5 Photo Modal
- [ ] Komponen `PhotoModal` — lightbox saat foto diklik
- [ ] Tampilkan gambar full size (embed Google Drive)
- [ ] Tabel EXIF data (kamera, ISO, aperture, dll)
- [ ] Link ke profil fotografer

### 3.6 User Dashboard
- [ ] Buat `app/dashboard/page.tsx` (protected route)
- [ ] Section input Folder ID Google Drive
- [ ] Tombol "Sync Drive" → loading state → success notification
- [ ] Daftar foto milik sendiri (grid)
- [ ] Toggle per foto: publik ↔ privat
- [ ] Tombol hapus per foto (dengan konfirmasi)

### 3.7 Profile Page Fotografer
- [ ] Buat `app/photographers/[username]/page.tsx`
- [ ] Avatar, nama, bio, link Instagram/portfolio
- [ ] Grid foto publik fotografer tersebut

### 3.8 Settings Page
- [ ] Buat `app/settings/page.tsx`
- [ ] Form edit: display_name, username, bio, instagram, portfolio
- [ ] Tombol save → `PATCH /users/profile`

### 3.9 Verifikasi Minggu 3
- [ ] Login Google → JWT tersimpan → redirect ke dashboard
- [ ] Dashboard: input folder ID → klik sync → foto muncul
- [ ] Explore: foto dari berbagai user tampil, shuffle saat refresh
- [ ] Modal foto: EXIF data tampil lengkap
- [ ] Toggle privat → foto hilang dari explore

---

## Minggu 4 — Docker, Deployment & Demo
**Target:** Project live di internet, siap demo ke dosen

### 4.1 Docker Backend
- [ ] Buat `backend/Dockerfile`
- [ ] Buat `docker-compose.yml` (backend + postgres lokal untuk dev)
- [ ] Test build: `docker build -t lumina-api .`
- [ ] Test run: `docker run -p 8000:8000 lumina-api`

### 4.2 Deploy Backend ke Google Cloud Run
- [ ] Install `gcloud` CLI dan login
- [ ] Build & push image: `gcloud builds submit --tag gcr.io/PROJECT_ID/lumina-api`
- [ ] Deploy: `gcloud run deploy lumina-api --image gcr.io/...`
- [ ] Set environment variables di Cloud Run
- [ ] Test endpoint live: `https://lumina-api-xxx-uc.a.run.app/docs`

### 4.3 Deploy Frontend ke Vercel
- [ ] Push frontend ke GitHub repository
- [ ] Connect Vercel ke GitHub repo
- [ ] Set env vars: `NEXT_PUBLIC_API_URL` → URL Cloud Run
- [ ] Deploy → dapat URL Vercel
- [ ] Test login + sync dari URL Vercel

### 4.4 Domain & SSL
- [ ] (Jika punya domain) Tambah domain di Vercel/Cloudflare
- [ ] Enable Cloudflare proxy → SSL otomatis
- [ ] Update Google OAuth authorized origins & redirect URIs ke domain baru

### 4.5 Postman Collection
- [ ] Buat collection "Lumina API"
- [ ] Tambah semua 11 endpoint dengan contoh request/response
- [ ] Tambah environment variables (base_url, jwt_token)
- [ ] Export sebagai `Lumina.postman_collection.json`
- [ ] Simpan di `docs/` folder

### 4.6 Final QA
- [ ] Test semua endpoint dari Postman (bukan localhost, tapi URL live)
- [ ] Test seluruh user flow dari browser (bukan localhost)
- [ ] Screenshot semua halaman untuk dokumentasi
- [ ] Cek `/docs` Swagger dari URL live

### 4.7 Verifikasi Akhir
- [ ] ✅ `/docs` → Swagger UI tampil dengan 11 endpoint
- [ ] ✅ Login Google → JWT → dashboard berfungsi
- [ ] ✅ Sync folder Drive → foto muncul di explore
- [ ] ✅ Feed acak berbeda tiap refresh
- [ ] ✅ Toggle privat/publik berfungsi
- [ ] ✅ Hapus foto → 204, file Drive aman
- [ ] ✅ `/health` → semua status "OK"

---

## 📊 Progress Summary

| Minggu | Status | Selesai |
|---|---|---|
| Minggu 1 — Auth & Setup | ⬜ Belum Mulai | 0/15 |
| Minggu 2 — Drive & CRUD | ⬜ Belum Mulai | 0/18 |
| Minggu 3 — Frontend | ⬜ Belum Mulai | 0/22 |
| Minggu 4 — Deploy & Demo | ⬜ Belum Mulai | 0/16 |

> Update tabel ini setiap akhir sesi kerja!
