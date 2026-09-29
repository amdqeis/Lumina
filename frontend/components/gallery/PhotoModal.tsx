"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink, Camera, Aperture, Zap, Maximize2 } from "lucide-react";
import type { PhotoDetail } from "@/lib/api";
import { getPhotoDetail } from "@/lib/api";
import Link from "next/link";

interface PhotoModalProps {
  photoId: string | null;
  onClose: () => void;
}

const ExifRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
      <span className="index-label">{label}</span>
      <span className="text-fg text-xs font-mono">{value}</span>
    </div>
  );
};

export default function PhotoModal({ photoId, onClose }: PhotoModalProps) {
  const [photo, setPhoto] = useState<PhotoDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!photoId) { setPhoto(null); return; }
    setLoading(true);
    getPhotoDetail(photoId)
      .then(setPhoto)
      .catch(() => setPhoto(null))
      .finally(() => setLoading(false));
  }, [photoId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const thumbUrl = photo?.thumbnail_url?.replace(/=s\d+/, "=s1200") ?? null;
  const photographerName =
    photo?.photographer?.display_name || photo?.photographer?.username || "Unknown";

  return (
    <AnimatePresence>
      {photoId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-xl flex flex-col md:flex-row"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-10 text-fg-dim hover:text-fg-bright transition-colors p-2"
          >
            <X size={18} />
          </button>

          {/* Image panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex items-center justify-center p-6 pt-16 md:pt-6"
          >
            {loading ? (
              <div className="w-full max-w-2xl aspect-[4/3] bg-bg-secondary animate-pulse rounded-sm" />
            ) : thumbUrl ? (
              <img
                src={thumbUrl}
                alt={photo?.title || "Photo"}
                className="max-h-[80vh] max-w-full object-contain rounded-sm shadow-2xl"
              />
            ) : (
              <div className="w-64 h-64 bg-bg-secondary rounded-sm flex items-center justify-center">
                <Camera size={32} className="text-fg-dim" />
              </div>
            )}
          </motion.div>

          {/* Info panel */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full md:w-72 lg:w-80 border-t md:border-t-0 md:border-l border-white/[0.06] flex flex-col p-6 pt-5 gap-6 overflow-y-auto"
          >
            {/* Photo meta */}
            {photo && (
              <>
                <div>
                  {photo.title && (
                    <h2 className="font-editorial text-xl text-fg-bright leading-snug">
                      {photo.title}
                    </h2>
                  )}
                  {photo.caption && (
                    <p className="text-fg-dim text-sm mt-2 leading-relaxed">{photo.caption}</p>
                  )}
                </div>

                {/* Photographer */}
                <div className="divider pt-4">
                  <span className="index-label">Photographer</span>
                  <Link
                    href={`/photographers/${photo.photographer?.username || ""}`}
                    className="flex items-center gap-2 mt-2 group"
                  >
                    {photo.photographer?.avatar_url && (
                      <img
                        src={photo.photographer.avatar_url}
                        alt={photographerName}
                        className="w-7 h-7 rounded-full object-cover border border-white/10"
                      />
                    )}
                    <span className="text-fg-bright text-sm group-hover:text-fg transition-colors">
                      {photographerName}
                    </span>
                  </Link>
                </div>

                {/* EXIF Data */}
                {photo.exif_data && (
                  <div>
                    <span className="index-label">Camera Data</span>
                    <div className="mt-2">
                      {photo.exif_data.camera_make && photo.exif_data.camera_model && (
                        <ExifRow
                          label="Camera"
                          value={`${photo.exif_data.camera_make} ${photo.exif_data.camera_model}`}
                        />
                      )}
                      <ExifRow label="Focal Length" value={photo.exif_data.focal_length} />
                      <ExifRow label="Aperture" value={photo.exif_data.aperture ? `f/${photo.exif_data.aperture}` : null} />
                      <ExifRow label="ISO" value={photo.exif_data.iso_speed} />
                      <ExifRow label="Shutter" value={photo.exif_data.shutter_speed} />
                      {photo.exif_data.width && photo.exif_data.height && (
                        <ExifRow label="Resolution" value={`${photo.exif_data.width} × ${photo.exif_data.height}`} />
                      )}
                    </div>
                  </div>
                )}

                {/* Open in Drive */}
                {photo.view_url && (
                  <a
                    href={photo.view_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-fg-dim hover:text-fg-bright transition-colors mt-auto"
                  >
                    <ExternalLink size={13} />
                    <span className="index-label">View on Google Drive</span>
                  </a>
                )}
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
