"use client";

import { useEffect, useRef, useState } from "react";
import { getExploreFeed, type FeedPhoto } from "@/lib/api";
import { getSessionSeed } from "@/lib/auth";
import EditorialGrid from "@/components/gallery/EditorialGrid";
import { RefreshCw } from "lucide-react";

export default function ExplorePage() {
  const [photos, setPhotos] = useState<FeedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const sessionSeedRef = useRef(getSessionSeed());

  const fetchFeed = async (newSeed?: boolean) => {
    if (newSeed) {
      // Generate fresh seed so shuffle reorders
      const seed = Math.random().toString(36).slice(2);
      sessionStorage.setItem("lumina_session_seed", seed);
      sessionSeedRef.current = seed;
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await getExploreFeed(sessionSeedRef.current, 60);
      setPhotos(data.photos);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchFeed(); }, []);

  return (
    <div className="min-h-dvh pt-20 px-4 md:px-8 pb-16">
      {/* Page header */}
      <div className="flex items-end justify-between mb-8 pt-8">
        <div>
          <span className="index-label">[ EXPLORE ]</span>
          <h1 className="font-editorial text-4xl md:text-5xl text-fg-bright mt-2 leading-tight">
            Gallery
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {total > 0 && (
            <span className="index-label hidden md:block">
              {String(total).padStart(3, "0")} photos
            </span>
          )}
          <button
            onClick={() => fetchFeed(true)}
            disabled={refreshing}
            title="Reshuffle feed"
            className="flex items-center gap-2 text-fg-dim hover:text-fg-bright transition-colors duration-300 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span className="index-label hidden md:block">Reshuffle</span>
          </button>
        </div>
      </div>

      <div className="divider mb-8" />

      {/* Grid */}
      {loading ? (
        <div className="masonry-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="masonry-item bg-bg-secondary animate-pulse rounded-sm"
              style={{ paddingBottom: `${50 + Math.random() * 50}%` }}
            />
          ))}
        </div>
      ) : (
        <EditorialGrid photos={photos} />
      )}
    </div>
  );
}
