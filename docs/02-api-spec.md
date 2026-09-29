# 🛠️ Lumina — API Specification

> **File:** `docs/02-api-spec.md`
> **Base URL:** `https://api.lumina.my.id/api/v1`
> **Auth:** Bearer JWT (kecuali endpoint publik)
> **Docs:** `GET /docs` → Swagger UI interaktif

---

## Autentikasi & User

### `POST /api/v1/auth/google`
Tukar Google auth code menjadi JWT token.

- **Auth:** ❌ Tidak perlu
- **Request Body:**
```json
{
  "code": "4/0AX4XfWh...",
  "redirect_uri": "http://localhost:3000/auth/callback"
}
```
- **Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "display_name": "Budi Santoso",
    "username": "budisantoso",
    "avatar_url": "https://lh3.googleusercontent.com/..."
  }
}
```

---

### `GET /api/v1/auth/me`
Ambil data user yang sedang login.

- **Auth:** ✅ JWT Required
- **Response `200 OK`:**
```json
{
  "id": "uuid",
  "google_id": "1234567890",
  "display_name": "Budi Santoso",
  "username": "budisantoso",
  "bio": "Fotografer jalanan dari Jakarta",
  "avatar_url": "https://...",
  "instagram": "@budifoto",
  "portfolio": "https://budi.com",
  "created_at": "2026-09-29T15:00:00Z"
}
```

---

### `PATCH /api/v1/users/profile`
Update profil user yang login.

- **Auth:** ✅ JWT Required
- **Request Body (semua field opsional):**
```json
{
  "display_name": "Budi S.",
  "username": "budisantoso_id",
  "bio": "Street photographer based in Jakarta.",
  "instagram": "@budifoto",
  "portfolio": "https://budisantoso.com"
}
```
- **Response `200 OK`:** Updated user object

---

### `GET /api/v1/users/:username`
Lihat profil publik fotografer lain.

- **Auth:** ❌ Tidak perlu
- **Response `200 OK`:**
```json
{
  "display_name": "Budi Santoso",
  "username": "budisantoso",
  "bio": "Street photographer",
  "avatar_url": "https://...",
  "instagram": "@budifoto",
  "public_photo_count": 12,
  "photos": [ ...array of public photos... ]
}
```

---

## Explore Feed & Foto

### `GET /api/v1/explore/feed`
Ambil feed foto acak terkurasi (Diverse Weighted Shuffle).

- **Auth:** ❌ Tidak perlu
- **Query Params:**
  - `session_id` (string) — seed untuk shuffle, diambil dari cookie/localStorage
  - `limit` (int, default: 30) — jumlah foto
- **Response `200 OK`:**
```json
{
  "photos": [
    {
      "id": "uuid",
      "thumbnail_url": "https://drive.google.com/thumbnail?id=...",
      "title": "Golden Hour Jakarta",
      "photographer": {
        "username": "budisantoso",
        "display_name": "Budi Santoso",
        "avatar_url": "https://..."
      }
    }
  ],
  "total": 30
}
```

---

### `GET /api/v1/photos/:id`
Detail satu foto beserta metadata kamera (EXIF).

- **Auth:** ❌ Tidak perlu
- **Response `200 OK`:**
```json
{
  "id": "uuid",
  "drive_file_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
  "title": "Golden Hour Jakarta",
  "caption": "Diambil di Kota Tua saat golden hour",
  "thumbnail_url": "https://drive.google.com/thumbnail?id=...",
  "view_url": "https://drive.google.com/file/d/.../view",
  "exif_data": {
    "camera_make": "Canon",
    "camera_model": "EOS R5",
    "focal_length": "85mm",
    "aperture": "f/1.8",
    "iso": 400,
    "shutter_speed": "1/500s",
    "taken_at": "2026-09-15T17:30:00Z"
  },
  "photographer": {
    "username": "budisantoso",
    "display_name": "Budi Santoso"
  },
  "created_at": "2026-09-29T10:00:00Z"
}
```

---

## Manajemen Galeri Pribadi

### `GET /api/v1/me/photos`
Daftar semua foto milik user yang login (publik + privat).

- **Auth:** ✅ JWT Required
- **Response `200 OK`:**
```json
{
  "photos": [
    {
      "id": "uuid",
      "drive_file_id": "...",
      "title": "Golden Hour",
      "is_public": true,
      "thumbnail_url": "...",
      "created_at": "..."
    }
  ],
  "total": 15
}
```

---

### `POST /api/v1/me/sync-drive`
Sinkronkan foto dari folder Google Drive user.

- **Auth:** ✅ JWT Required
- **Request Body:**
```json
{
  "folder_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
}
```
- **Response `202 Accepted`:**
```json
{
  "message": "Sync started",
  "synced_count": 23,
  "skipped_count": 2
}
```

---

### `PATCH /api/v1/me/photos/:id`
Ubah caption atau status publik/privat.

- **Auth:** ✅ JWT Required
- **Request Body:**
```json
{
  "caption": "Caption baru untuk foto ini",
  "is_public": false
}
```
- **Response `200 OK`:** Updated photo object

---

### `DELETE /api/v1/me/photos/:id`
Hapus foto dari galeri (record DB dihapus, file Google Drive AMAN).

- **Auth:** ✅ JWT Required
- **Response `204 No Content`** (body kosong)

---

## Monitoring

### `GET /api/v1/health`
Cek kesehatan sistem.

- **Auth:** ❌ Tidak perlu
- **Response `200 OK`:**
```json
{
  "status": "ok",
  "database": "connected",
  "google_api": "reachable",
  "timestamp": "2026-09-29T15:00:00Z"
}
```

---

### `GET /docs`
Swagger UI interaktif — semua endpoint bisa dicoba langsung dari browser.
