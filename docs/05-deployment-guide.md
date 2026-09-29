# 🚀 Lumina — Deployment Guide

> **File:** `docs/05-deployment-guide.md`
> **Target Deploy:** Google Cloud Run (Backend) + Vercel (Frontend)

---

## Step 1 — Google Cloud Console Setup

### 1.1 Buat Project Baru
1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Klik dropdown project → **New Project**
3. Nama project: `lumina`
4. Klik **Create**

### 1.2 Aktifkan Google Drive API
1. Di sidebar: **APIs & Services → Library**
2. Cari `Google Drive API` → klik → **Enable**

### 1.3 Buat OAuth 2.0 Client ID
1. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
2. Application type: **Web application**
3. Name: `Lumina Web Client`
4. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://lumina.your-domain.com
   ```
5. **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   https://lumina.your-domain.com/auth/callback
   ```
6. Klik **Create** → catat `Client ID` dan `Client Secret`

### 1.4 Configure OAuth Consent Screen
1. **APIs & Services → OAuth consent screen**
2. User Type: **External**
3. App name: `Lumina`
4. Scopes yang diperlukan:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/drive.readonly`

> ⚠️ Untuk tahap development, tambahkan email akun test di bagian "Test users"

---

## Step 2 — Database Setup (Neon PostgreSQL)

### 2.1 Buat Akun & Database
1. Buka [neon.tech](https://neon.tech) → Sign up gratis
2. **Create Project** → nama: `lumina`
3. Pilih region: `Asia Pacific (Singapore)` untuk latensi rendah
4. Catat **Connection String**: `postgresql://user:pass@host/dbname?sslmode=require`

### 2.2 Jalankan Schema
1. Di Neon Console → **SQL Editor**
2. Copy-paste SQL dari `docs/03-database-schema.md`
3. Klik **Run** → verifikasi tabel `users` dan `photos` terbuat

---

## Step 3 — Environment Variables

### Backend `.env`
```env
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host/lumina?ssl=require

# Google OAuth
GOOGLE_CLIENT_ID=xxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx

# JWT
JWT_SECRET_KEY=your-super-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# App
APP_ENV=production
ALLOWED_ORIGINS=https://lumina.your-domain.com
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=https://lumina-api-xxx-uc.a.run.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxxx.apps.googleusercontent.com
```

---

## Step 4 — Docker Build & Push

```bash
# Login ke Google Container Registry
gcloud auth login
gcloud config set project lumina-PROJECT-ID

# Build dan push image
cd backend
gcloud builds submit --tag gcr.io/PROJECT_ID/lumina-api

# Atau pakai Docker langsung:
docker build -t gcr.io/PROJECT_ID/lumina-api .
docker push gcr.io/PROJECT_ID/lumina-api
```

---

## Step 5 — Deploy ke Google Cloud Run

```bash
gcloud run deploy lumina-api \
  --image gcr.io/PROJECT_ID/lumina-api \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="postgresql+asyncpg://..." \
  --set-env-vars GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com" \
  --set-env-vars GOOGLE_CLIENT_SECRET="GOCSPX-xxx" \
  --set-env-vars JWT_SECRET_KEY="your-secret-key" \
  --min-instances 0 \
  --max-instances 10
```

Setelah deploy, catat URL yang diberikan Cloud Run:
`https://lumina-api-XXXX-as.a.run.app`

---

## Step 6 — Deploy Frontend ke Vercel

```bash
# Install Vercel CLI (opsional)
npm i -g vercel

# Di folder frontend
cd frontend
vercel

# Atau push ke GitHub → connect di vercel.com
```

Set environment variables di Vercel dashboard:
- `NEXT_PUBLIC_API_URL` = URL Cloud Run dari Step 5
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = Google Client ID

---

## Step 7 — Domain & SSL (Cloudflare)

### Jika punya domain `.my.id`:
1. Buka Cloudflare → tambahkan domain
2. Update nameserver ke Cloudflare di registrar
3. Di Cloudflare **DNS → Add Record:**
   - `CNAME` `lumina` → `cname.vercel-dns.com` (untuk frontend)
   - `CNAME` `api` → URL Cloud Run (opsional, bisa pakai URL langsung)
4. SSL/TLS → mode **Full (strict)**
5. Cloudflare otomatis provide SSL certificate

---

## Step 8 — Verifikasi Final

```bash
# Health check
curl https://lumina-api-xxx-uc.a.run.app/api/v1/health

# Ekspektasi response:
{
  "status": "ok",
  "database": "connected",
  "google_api": "reachable"
}

# Swagger UI
open https://lumina-api-xxx-uc.a.run.app/docs
```

---

## Troubleshooting

| Error | Solusi |
|---|---|
| `redirect_uri_mismatch` | Tambahkan callback URL ke Google Console |
| `Database connection refused` | Cek `DATABASE_URL` — pastikan pakai `asyncpg` driver |
| `CORS error` di browser | Tambahkan domain frontend ke `ALLOWED_ORIGINS` |
| `Drive API quota exceeded` | Tunggu sebentar, quota reset tiap hari |
| Cloud Run `cold start` lambat | Set `--min-instances 1` (berbayar) atau biarkan |

---

## Postman Collection

File: `docs/Lumina.postman_collection.json`

Import ke Postman:
1. **Import → Upload Files** → pilih file JSON
2. Set environment variable `base_url` = URL live Anda
3. Jalankan endpoint auth dulu → copy `access_token`
4. Set environment variable `jwt_token` = token tersebut
5. Semua endpoint protected akan otomatis pakai token

