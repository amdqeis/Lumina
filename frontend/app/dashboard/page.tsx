"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyPhotos, syncDrive, updatePhoto, deletePhoto, type Photo } from "@/lib/api";
import { Loader2, RefreshCw, Eye, EyeOff, Trash2, FolderSync } from "lucide-react";

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/[0.06] animate-pulse">
      <div className="w-12 h-12 bg-bg-secondary rounded-sm flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-bg-secondary rounded w-48" />
        <div className="h-2 bg-bg-secondary rounded w-24" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [folderId, setFolderId] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced_count: number; skipped_count: number } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [authLoading, user, router]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const data = await getMyPhotos();
      setPhotos(data.photos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadPhotos();
  }, [user]);

  const handleSync = async () => {
    if (!folderId.trim()) {
      inputRef.current?.focus();
      return;
    }
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    try {
      const result = await syncDrive(folderId.trim());
      setSyncResult(result);
      await loadPhotos();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Sync failed. Check your folder ID.";
      setSyncError(msg);
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleVisibility = async (photo: Photo) => {
    setTogglingId(photo.id);
    try {
      await updatePhoto(photo.id, { is_public: !photo.is_public });
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, is_public: !p.is_public } : p))
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (!confirm(`Remove "${photo.title || "this photo"}" from Lumina? (Your Google Drive file stays safe)`)) return;
    setDeletingId(photo.id);
    try {
      await deletePhoto(photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 size={20} className="text-fg-dim animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh pt-20 px-4 md:px-8 pb-20 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="pt-8 mb-8">
        <span className="index-label">[ DASHBOARD ]</span>
        <h1 className="font-editorial text-4xl text-fg-bright mt-2">
          My Gallery
        </h1>
        {user && (
          <p className="text-fg-dim text-sm mt-1">
            {user.display_name || user.username || "Photographer"}
          </p>
        )}
      </div>

      <div className="divider mb-8" />

      {/* ── Sync Drive Section ── */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <FolderSync size={14} className="text-fg-dim" />
          <h2 className="index-label text-fg-bright">Sync from Google Drive</h2>
        </div>
        <p className="text-fg-dim text-sm mb-4 leading-relaxed">
          Paste your Google Drive folder ID (the long string in the folder URL).<br />
          We&apos;ll read the images — your files are never modified.
        </p>

        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSync(); }}
            className="flex-1 bg-bg-secondary border border-white/10 focus:border-white/25 outline-none px-4 py-2.5 text-sm text-fg-bright placeholder:text-fg-dim font-mono rounded-sm transition-colors"
          />
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 bg-fg-bright text-bg text-sm font-medium hover:bg-fg transition-colors duration-300 disabled:opacity-60 rounded-sm"
          >
            {syncing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {syncing ? "Syncing…" : "Sync Drive"}
          </button>
        </div>

        {/* Sync result */}
        {syncResult && (
          <div className="mt-3 p-3 border border-white/10 bg-bg-secondary rounded-sm">
            <p className="index-label text-fg-bright">
              ✓ Sync complete — {syncResult.synced_count} added, {syncResult.skipped_count} already existed
            </p>
          </div>
        )}
        {syncError && (
          <div className="mt-3 p-3 border border-red-900/50 bg-red-900/10 rounded-sm">
            <p className="index-label text-red-400">{syncError}</p>
          </div>
        )}
      </section>

      <div className="divider mb-8" />

      {/* ── Photos List ── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="index-label text-fg-bright">
            My Photos ({photos.length})
          </h2>
          <button
            onClick={loadPhotos}
            className="text-fg-dim hover:text-fg-bright transition-colors"
            title="Refresh"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : photos.length === 0 ? (
          <div className="text-center py-16">
            <span className="index-label">[ 000 ] No photos yet</span>
            <p className="text-fg-dim text-sm mt-3">Sync a Google Drive folder above to add photos.</p>
          </div>
        ) : (
          <div>
            {photos.map((photo, i) => {
              const thumb = photo.thumbnail_url?.replace(/=s\d+/, "=s120") ?? null;
              return (
                <div
                  key={photo.id}
                  className="flex items-center gap-4 py-3 border-b border-white/[0.06] group"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 flex-shrink-0 bg-bg-secondary rounded-sm overflow-hidden">
                    {thumb ? (
                      <img src={thumb} alt={photo.title || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-fg-bright text-sm truncate">{photo.title || `Photo ${i + 1}`}</p>
                    <p className="index-label mt-0.5">
                      {new Date(photo.created_at).toLocaleDateString("id-ID")}
                      {photo.caption && ` • ${photo.caption.slice(0, 40)}…`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* Toggle public/private */}
                    <button
                      onClick={() => handleToggleVisibility(photo)}
                      disabled={togglingId === photo.id}
                      title={photo.is_public ? "Make private" : "Make public"}
                      className="text-fg-dim hover:text-fg-bright transition-colors"
                    >
                      {togglingId === photo.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : photo.is_public ? (
                        <Eye size={14} />
                      ) : (
                        <EyeOff size={14} className="opacity-50" />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(photo)}
                      disabled={deletingId === photo.id}
                      title="Remove from Lumina"
                      className="text-fg-dim hover:text-red-400 transition-colors"
                    >
                      {deletingId === photo.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>

                  {/* Visibility badge */}
                  <span
                    className={`index-label flex-shrink-0 ${
                      photo.is_public ? "text-fg-dim" : "text-fg-dim opacity-40"
                    }`}
                  >
                    {photo.is_public ? "PUBLIC" : "PRIVATE"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
