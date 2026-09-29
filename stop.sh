#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  Lumina — Stop All Servers
#  Jalankan: bash stop.sh
# ─────────────────────────────────────────────────────────────

GREEN="\033[0;32m"
RED="\033[0;31m"
RESET="\033[0m"

ok()  { echo -e "${GREEN}[✓]${RESET} $*"; }
warn(){ echo -e "${RED}[✗]${RESET} $*"; }

stop_pid() {
  local name="$1"
  local pidfile="$2"
  local port="$3"

  if [ -f "$pidfile" ]; then
    PID=$(cat "$pidfile")
    if kill "$PID" 2>/dev/null; then
      ok "$name (PID $PID) dihentikan"
    else
      warn "$name PID $PID sudah tidak berjalan"
    fi
    rm -f "$pidfile"
  fi

  # Kill apapun yang masih pakai port tersebut
  if lsof -ti:"$port" &>/dev/null; then
    kill "$(lsof -ti:"$port")" 2>/dev/null || true
    ok "Port $port dibersihkan"
  fi
}

stop_pid "Backend"  /tmp/lumina-backend.pid  8000
stop_pid "Frontend" /tmp/lumina-frontend.pid 3000

echo ""
echo -e "${GREEN}Semua server Lumina dihentikan.${RESET}"
