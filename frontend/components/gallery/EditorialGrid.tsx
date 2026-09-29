"use client";

import { useState } from "react";
import PhotoCard from "./PhotoCard";
import PhotoModal from "./PhotoModal";
import type { FeedPhoto } from "@/lib/api";

interface EditorialGridProps {
  photos: FeedPhoto[];
}

export default function EditorialGrid({ photos }: EditorialGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="index-label">[ 000 ]</span>
        <p className="text-fg-dim text-sm mt-3">No photos yet. Be the first to sync your gallery.</p>
      </div>
    );
  }

  return (
    <>
      <div className="masonry-grid">
        {photos.map((photo, i) => (
          <PhotoCard
            key={photo.id}
            photo={{ ...photo, index: i }}
            onClick={() => setSelectedId(photo.id)}
          />
        ))}
      </div>

      <PhotoModal photoId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
