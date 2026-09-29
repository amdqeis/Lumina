import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("lumina_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("lumina_token");
      localStorage.removeItem("lumina_user");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── API Functions ───────────────────────────────────────

export interface User {
  id: string;
  google_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  instagram: string | null;
  portfolio: string | null;
  created_at: string;
}

export interface ExifData {
  camera_make: string | null;
  camera_model: string | null;
  focal_length: string | null;
  aperture: string | null;
  iso_speed: number | null;
  shutter_speed: string | null;
  width: number | null;
  height: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface Photographer {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Photo {
  id: string;
  drive_file_id: string;
  title: string | null;
  caption: string | null;
  is_public: boolean;
  thumbnail_url: string | null;
  exif_data: ExifData | null;
  created_at: string;
  photographer: Photographer | null;
}

export interface PhotoDetail extends Photo {
  view_url: string | null;
}

export interface FeedPhoto {
  id: string;
  thumbnail_url: string | null;
  title: string | null;
  photographer: Photographer;
}

export interface PublicProfile {
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  instagram: string | null;
  portfolio: string | null;
  public_photo_count: number;
  photos: { id: string; thumbnail_url: string | null; title: string | null }[];
}

// Auth
export const exchangeGoogleCode = (code: string, redirect_uri: string) =>
  api.post("/auth/google", { code, redirect_uri }).then((r) => r.data);
export const getMe = () => api.get<User>("/auth/me").then((r) => r.data);

// Users
export const updateProfile = (data: Partial<User>) =>
  api.patch<User>("/users/profile", data).then((r) => r.data);
export const getPublicProfile = (username: string) =>
  api.get<PublicProfile>(`/users/${username}`).then((r) => r.data);

// Explore
export const getExploreFeed = (sessionId: string, limit = 30) =>
  api
    .get<{ photos: FeedPhoto[]; total: number }>("/explore/feed", {
      params: { session_id: sessionId, limit },
    })
    .then((r) => r.data);

// Photos
export const getPhotoDetail = (id: string) =>
  api.get<PhotoDetail>(`/photos/${id}`).then((r) => r.data);

// My gallery
export const getMyPhotos = () =>
  api.get<{ photos: Photo[]; total: number }>("/me/photos").then((r) => r.data);
export const syncDrive = (folder_id: string) =>
  api
    .post<{ synced_count: number; skipped_count: number; message: string }>("/me/sync-drive", { folder_id })
    .then((r) => r.data);
export const updatePhoto = (id: string, data: { title?: string; caption?: string; is_public?: boolean }) =>
  api.patch<Photo>(`/me/photos/${id}`, data).then((r) => r.data);
export const deletePhoto = (id: string) => api.delete(`/me/photos/${id}`);

// Health
export const getHealth = () => api.get("/health").then((r) => r.data);
