// ─── Google OAuth helpers ────────────────────────────────

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

// Hardcoded — jangan pakai window.location.origin (bisa menghasilkan URL invalid di Next.js dev)
const REDIRECT_URI = "http://localhost:3000/auth/callback";

export function getGoogleOAuthURL(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/drive.readonly",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
  });
  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
}

export function getRedirectURI(): string {
  return REDIRECT_URI;
}

// ─── Token management ────────────────────────────────────

export function saveAuth(token: string, user: object) {
  localStorage.setItem("lumina_token", token);
  localStorage.setItem("lumina_user", JSON.stringify(user));
}

export function getStoredUser<T = object>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("lumina_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lumina_token");
}

export function clearAuth() {
  localStorage.removeItem("lumina_token");
  localStorage.removeItem("lumina_user");
}

export function isLoggedIn(): boolean {
  return !!getStoredToken();
}

// ─── Session seed for explore feed ──────────────────────

export function getSessionSeed(): string {
  if (typeof window === "undefined") return "anonymous";
  let seed = sessionStorage.getItem("lumina_session_seed");
  if (!seed) {
    seed = Math.random().toString(36).slice(2);
    sessionStorage.setItem("lumina_session_seed", seed);
  }
  return seed;
}
