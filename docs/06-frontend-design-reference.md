# 🎨 Lumina — Frontend Design Reference (Aristide Benoist Style)

> **File:** `docs/06-frontend-design-reference.md`
> **Inspirasi Utama:** [aristidebenoist.com](https://aristidebenoist.com) (Awwwards Independent Developer of the Year)
> **Gaya Desain:** Dark Minimalist, Editorial Typography, Tactile Motion, WebGL/Canvas Transitions

---

## 1. Analisis Sumber & Status Repositori

| Item | Status | Keterangan |
|---|---|---|
| **Website Resmi** | Closed Source (Proprietary) | Tidak ada public repository resmi dari Aristide Benoist di GitHub. |
| **Client Bundle** | Minified Vanilla JS (`d.js`) + WebGL Shaders | Berjalan di atas canvas WebGL kustom dengan per-pixel interaction. |
| **Open Source Clones & Tutorials** | Tersedia di Codrops & GitHub | Beragam developer & Codrops telah merilis tutorial dan demo source code untuk mereplikasi efeknya. |

### Repositori & Sumber Terbuka Terkait (Siap Pakai untuk Refrensi):
1. **[Anemolo/GridToFullscreenAnimations](https://github.com/Anemolo/GridToFullscreenAnimations)** — Transisi Grid ke Fullscreen menggunakan Three.js & GLSL shaders (efek zoom-in foto sinematik).
2. **[Codrops GridViewSwitch](https://tympanus.net/Development/GridViewSwitch/)** — Transisi animasi perpindahan mode layout galeri foto dengan GSAP Flip.
3. **[Codrops StackToContent](https://tympanus.net/codrops/2022/05/11/stack-to-content-layout-transition/)** — Transisi tumpukan foto (stack) melebar menjadi galeri detail.
4. **[Studio Freight / Lenis](https://github.com/darkroomengineering/lenis)** — Smooth scrolling engine modern, ringan, dan 60fps untuk efek inertia scroll khas Aristide Benoist.

---

## 2. Bedah Karakteristik Visual & Desain Aristide Benoist

### A. Palet Warna (Earthy Dark Minimal)
Aristide tidak menggunakan hitam pekat (`#000000`) melainkan charcoal organik bernuansa mineral:
- **Background Utama:** `#141414` (Deep Charcoal Slate)
- **Background Secondary / Surface:** `#1C1C1C` / `#181818`
- **Text Utama (Muted Sage Mist):** `#BAC4B8` (Abu-abu kehijauan lembut, nyaman di mata)
- **Text Dimmed (Metadata/Labels):** `#6E756C` (Subdued Olive Gray)
- **Highlight / Active State:** `#F0F4EE` (Paling terang untuk judul aktif / hover)

### B. Tipografi & Tata Letak
- **Kombinasi Font:**
  - **Heading & Hero:** Editorial Serif yang anggun (misal: *Newsreader*, *Cormorant Garamond*, atau *Playfair Display*)
  - **Body & Metadata EXIF:** Technical Monospace / Clean Grotesk (*Space Grotesk*, *Geist Mono*, atau *JetBrains Mono*)
- **Elemen Dekoratif Khas:**
  - Penomoran berformat indeks: `[ 001 ]`, `( 01 / 24 )`
  - Garis tipis 1px divider dengan opacity rendah (`border-white/10`)
  - Label status mikro: `● CLOUD SYNC ACTIVE`, `ISO 200 • f/2.8`

### C. Motion & Micro-interactions
- **Inertial Momentum:** Scroll dan drag galeri memiliki bobot/damping halus (menggunakan Lenis atau Framer Motion).
- **Subtle Image Zoom & Distortion:** Saat cursor hover di atas foto, foto sedikit membesar dengan transisi kurva cubic-bezier lambat (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Lightbox / Modal Reveal:** Transisi halus dari posisi thumbnail foto ke modal fullscreen tanpa jeda kasar (FLIP transition).

---

## 3. Implementasi ke Lumina

### Struktur Komponen Frontend
```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Minimalist floating nav dengan status indicator
│   │   ├── Footer.tsx         # Minimal editorial footer + index counter
│   │   └── SmoothScroll.tsx   # Lenis smooth scroll provider
│   ├── gallery/
│   │   ├── EditorialGrid.tsx  # Asymmetric / Editorial Masonry Grid
│   │   ├── PhotoCard.tsx      # Hover inertia, custom aspect ratio, subtle scale
│   │   └── PhotoModal.tsx     # Cinematic lightbox + EXIF data inspector
│   └── dashboard/
│       ├── SyncFolderInput.tsx# Input Drive Folder ID dengan gaya monospaced minimal
│       └── UserPhotoRow.tsx   # List manajemen foto user dengan toggle publik/privat
```

### Rekomendasi Library Frontend untuk Efek Ini
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS (dengan custom theme `#141414` & `#BAC4B8`)
- **Smooth Scrolling:** `lenis` (`@studio-freight/lenis`)
- **Animasi & Transisi:** `framer-motion` (untuk modal FLIP dan stagger reveal)
- **Icons:** `lucide-react` (garis 1px ultra-thin)
