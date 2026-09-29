#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  Lumina — Dev Starter
#  Jalankan: bash start.sh
# ─────────────────────────────────────────────────────────────

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# ── Warna ────────────────────────────────────────────────────
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
RESET="\033[0m"

log()  { echo -e "${CYAN}[lumina]${RESET} $*"; }
ok()   { echo -e "${GREEN}[✓]${RESET} $*"; }
warn() { echo -e "${YELLOW}[!]${RESET} $*"; }
err()  { echo -e "${RED}[✗]${RESET} $*"; }

# ── Cek .env ─────────────────────────────────────────────────
if [ ! -f "$BACKEND/.env" ]; then
  err "backend/.env tidak ditemukan. Salin dari backend/.env.example dan isi kredensialnya."
  exit 1
fi

if [ ! -f "$FRONTEND/.env.local" ]; then
  err "frontend/.env.local tidak ditemukan. Salin dari frontend/.env.local.example dan isi kredensialnya."
  exit 1
fi

ok "File .env ditemukan"

# ── Backend ──────────────────────────────────────────────────
log "Memulai backend (FastAPI) di http://localhost:8000 ..."

# Matikan proses lama di port 8000 jika ada
if lsof -ti:8000 &>/dev/null; then
  warn "Port 8000 sedang dipakai, mematikan proses lama..."
  kill "$(lsof -ti:8000)" 2>/dev/null || true
  sleep 1
fi

(
  cd "$BACKEND"
  if [ -d "venv" ]; then
    source venv/bin/activate
  fi
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 \
    >> /tmp/lumina-backend.log 2>&1 &
  echo $! > /tmp/lumina-backend.pid
)

# Tunggu backend siap
log "Menunggu backend siap..."
for i in $(seq 1 15); do
  if curl -sf http://localhost:8000/api/v1/health &>/dev/null; then
    ok "Backend siap!"
    break
  fi
  sleep 1
  if [ "$i" -eq 15 ]; then
    err "Backend gagal start. Cek log: tail -f /tmp/lumina-backend.log"
    exit 1
  fi
done

# ── Frontend ─────────────────────────────────────────────────
log "Memulai frontend (Next.js) di http://localhost:3000 ..."

# Matikan proses lama di port 3000 jika ada
if lsof -ti:3000 &>/dev/null; then
  warn "Port 3000 sedang dipakai, mematikan proses lama..."
  kill "$(lsof -ti:3000)" 2>/dev/null || true
  sleep 1
fi

(
  cd "$FRONTEND"
  npm run dev -- --port 3000 \
    >> /tmp/lumina-frontend.log 2>&1 &
  echo $! > /tmp/lumina-frontend.pid
)

# Tunggu frontend siap
log "Menunggu frontend siap..."
for i in $(seq 1 20); do
  if curl -sf http://localhost:3000 &>/dev/null; then
    ok "Frontend siap!"
    break
  fi
  sleep 1
  if [ "$i" -eq 20 ]; then
    err "Frontend gagal start. Cek log: tail -f /tmp/lumina-frontend.log"
    exit 1
  fi
done

# ── Selesai ──────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}  Lumina berjalan!${RESET}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  Frontend  →  ${CYAN}http://localhost:3000${RESET}"
echo -e "  Backend   →  ${CYAN}http://localhost:8000${RESET}"
echo -e "  API Docs  →  ${CYAN}http://localhost:8000/docs${RESET}"
echo -e "  Health    →  ${CYAN}http://localhost:8000/api/v1/health${RESET}"
echo ""
echo -e "  Logs:"
echo -e "    Backend  : ${YELLOW}tail -f /tmp/lumina-backend.log${RESET}"
echo -e "    Frontend : ${YELLOW}tail -f /tmp/lumina-frontend.log${RESET}"
echo ""
echo -e "  Untuk stop semua: ${RED}bash stop.sh${RESET}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Tunggu Ctrl+C untuk graceful stop
trap 'echo ""; log "Menghentikan semua server..."; \
  kill "$(cat /tmp/lumina-backend.pid 2>/dev/null)" 2>/dev/null || true; \
  kill "$(cat /tmp/lumina-frontend.pid 2>/dev/null)" 2>/dev/null || true; \
  kill "$TAIL_BE_PID" 2>/dev/null || true; \
  kill "$TAIL_FE_PID" 2>/dev/null || true; \
  ok "Semua server dihentikan."; exit 0' INT TERM

# ── Stream log live ke terminal ───────────────────────────────
echo -e "${CYAN}[lumina]${RESET} Streaming logs (Ctrl+C untuk stop)...\n"

tail -f /tmp/lumina-backend.log  | sed "s/^/${YELLOW}[backend] ${RESET}/"  &
TAIL_BE_PID=$!

tail -f /tmp/lumina-frontend.log | sed "s/^/${CYAN}[frontend]${RESET} /" &
TAIL_FE_PID=$!

wait
