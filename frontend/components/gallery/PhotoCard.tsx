"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FeedPhoto } from "@/lib/api";

interface PhotoCardProps {
  photo: FeedPhoto & { index?: number };
  onClick: () => void;
}

export default function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Google Drive thumbnail with larger size
  const thumbUrl = photo.thumbnail_url
    ? photo.thumbnail_url.replace(/=s\d+/, "=s800")
    : null;

  const photographerName =
    photo.photographer?.display_name ||
    photo.photographer?.username ||
    "Unknown";

  return (
    <div
      className="masonry-item relative cursor-pointer overflow-hidden rounded-sm group"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Skeleton */}
      {!loaded && (
        <div className="w-full bg-bg-secondary animate-pulse" style={{ paddingBottom: "75%" }} />
      )}

      {/* Image */}
      {thumbUrl ? (
        <motion.img
          src={thumbUrl}
          alt={photo.title || "Photo"}
          className={`w-full object-cover transition-all duration-700 ease-expo ${
            loaded ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
          style={{ display: "block" }}
          animate={{ scale: hovered ? 1.04 : 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <div className="w-full bg-bg-secondary flex items-center justify-center" style={{ paddingBottom: "75%" }}>
          <span className="text-fg-dim text-xs absolute">No preview</span>
        </div>
      )}

      {/* Hover overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent flex flex-col justify-end p-3"
          >
            {photo.title && (
              <p className="text-fg-bright text-sm font-light truncate leading-tight">
                {photo.title}
              </p>
            )}
            <p className="index-label mt-0.5 truncate">
              {photographerName}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
