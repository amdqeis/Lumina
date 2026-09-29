"use client";

import { useState } from "react";
import PhotoModal from "@/components/gallery/PhotoModal";

interface PhotoSummary {
  id: string;
  thumbnail_url: string | null;
  title: string | null;
}

export default function ProfileGallery({ photos }: { photos: PhotoSummary[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="index-label">No public photos yet</span>
      </div>
    );
  }

  return (
    <>
      <div className="masonry-grid">
        {photos.map((photo) => {
          const thumb = photo.thumbnail_url?.replace(/=s\d+/, "=s800") ?? null;
          return (
            <div
              key={photo.id}
              className="masonry-item relative cursor-pointer overflow-hidden rounded-sm group"
              onClick={() => setSelectedId(photo.id)}
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={photo.title || "Photo"}
                  className="w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.04]"
                />
              ) : (
                <div className="w-full bg-bg-secondary" style={{ paddingBottom: "75%" }} />
              )}
            </div>
          );
        })}
      </div>
      <PhotoModal photoId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
