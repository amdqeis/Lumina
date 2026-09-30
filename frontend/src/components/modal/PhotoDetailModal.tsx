"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExhibitionItem } from "@/lib/curatedExhibition";
import {
  X,
  Camera,
  Aperture,
  Clock,
  Sliders,
  HardDrive,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PhotoDetailModalProps {
  photo: ExhibitionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function PhotoDetailModal({
  photo,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: PhotoDetailModalProps) {
  // ESC and Arrow keys listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext) onNext();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, onNext, onPrev]);

  if (!photo) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-auto">
          {/* ─── Backdrop ─── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0a0b0a]/95 backdrop-blur-2xl"
          />

          {/* ─── Modal: shared element expansion from card ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-7xl max-h-[92vh] flex flex-col lg:flex-row overflow-hidden border border-[#bac4b8]/15 bg-[#111] shadow-[0_40px_100px_rgba(0,0,0,0.95)]"
          >
            {/* ─── Close Button ─── */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a]/90 hover:bg-[#242424] text-[#bac4b8] hover:text-white border border-[#bac4b8]/20 transition-all duration-200 group cursor-pointer"
              aria-label="Close modal"
            >
              <span className="text-[9px] font-mono tracking-widest uppercase">ESC</span>
              <X size={14} className="group-hover:rotate-90 transition-transform duration-300 text-[#cc9933]" />
            </button>

            {/* ─── Left: Cinematic Photo Hero ─── */}
            <div className="flex-1 bg-[#0a0a0a] flex items-center justify-center p-6 sm:p-10 md:p-14 relative overflow-hidden min-h-[340px] lg:min-h-[580px]">
              {/* Prev navigation */}
              {onPrev && (
                <button
                  onClick={onPrev}
                  className="absolute left-5 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-[#181818]/80 hover:bg-[#222] border border-[#bac4b8]/15 text-[#bac4b8] hover:text-white transition-all cursor-pointer backdrop-blur-sm group"
                  aria-label="Previous work"
                >
                  <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
              )}
              {/* Next navigation */}
              {onNext && (
                <button
                  onClick={onNext}
                  className="absolute right-5 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-[#181818]/80 hover:bg-[#222] border border-[#bac4b8]/15 text-[#bac4b8] hover:text-white transition-all cursor-pointer backdrop-blur-sm group"
                  aria-label="Next work"
                >
                  <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Shared element image expansion */}
              <motion.div
                layoutId={`photo-box-${photo.id}`}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative max-h-[76vh] w-full flex items-center justify-center shadow-2xl overflow-hidden"
              >
                <motion.img
                  layoutId={`photo-img-${photo.id}`}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  src={photo.imageUrl}
                  alt={photo.fullTitle}
                  className="max-h-[76vh] w-auto max-w-full object-contain border border-white/8"
                />
              </motion.div>
            </div>

            {/* ─── Right: Curatorial Panel ─── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="w-full lg:w-[440px] xl:w-[480px] p-8 sm:p-10 flex flex-col justify-between overflow-y-auto border-t lg:border-t-0 lg:border-l border-[#bac4b8]/12 bg-[#111]"
            >
              <div>
                {/* Meta header */}
                <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.25em] text-[#cc9933] uppercase mb-5 font-semibold">
                  <span>EXHIBITION #{photo.index}</span>
                  <span className="px-2 py-0.5 bg-[#cc9933]/10 border border-[#cc9933]/25 text-[9px]">
                    {photo.type || "FINE ART"}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal tracking-wide mb-2 leading-tight">
                  {photo.fullTitle}
                </h2>

                {/* Photographer & Year */}
                <div className="text-xs font-mono tracking-wider text-[#bac4b8]/80 mb-7 uppercase flex items-center gap-2.5">
                  <span className="text-[#cc9933]">{photo.clientOrArtist}</span>
                  <span className="text-[#bac4b8]/30">·</span>
                  <span>{photo.year}</span>
                </div>

                {/* Curatorial description */}
                <div className="text-sm leading-relaxed text-[#bac4b8]/80 mb-8 border-l-2 border-[#cc9933]/60 pl-4 py-1">
                  {photo.description ||
                    "Captured with precision optics and preserved within the Lumina decentralized cloud archive directly via Google Drive integration."}
                </div>

                {/* EXIF Telemetry */}
                <div className="mb-7">
                  <h4 className="text-[9px] font-mono tracking-[0.25em] text-[#bac4b8]/50 uppercase mb-3 font-semibold">
                    OPTICS & EXIF
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                    {[
                      { icon: <Camera size={11} />, label: "SENSOR", value: photo.roleOrGear?.split("·")[0]?.trim() || "SONY A7 IV" },
                      { icon: <Aperture size={11} />, label: "OPTIC", value: photo.roleOrGear?.split("·")[1]?.trim() || "85MM F/1.4" },
                      { icon: <Clock size={11} />, label: "SHUTTER", value: photo.roleOrGear?.split("·")[2]?.trim() || "1/500s" },
                      { icon: <Sliders size={11} />, label: "ISO", value: photo.roleOrGear?.split("·")[3]?.trim() || "ISO 100" },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="p-3 bg-[#181818] border border-[#bac4b8]/12 flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-[9px] text-[#bac4b8]/50">
                          <span className="text-[#cc9933]">{icon}</span> {label}
                        </span>
                        <span className="text-white text-[11px] truncate font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Storage badge */}
                <div className="p-3.5 bg-[#161210] border border-[#cc9933]/25 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <HardDrive size={14} className="text-[#cc9933]" />
                    <span className="text-[#bac4b8]/80">STORAGE GATEWAY</span>
                  </div>
                  <span className="text-[9px] text-[#cc9933] px-2 py-0.5 bg-[#cc9933]/12 uppercase font-bold tracking-wider">
                    GOOGLE DRIVE v3
                  </span>
                </div>
              </div>

              {/* Bottom actions */}
              <div className="mt-8 pt-5 border-t border-[#bac4b8]/12 flex items-center justify-between">
                <a
                  href={photo.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-mono text-[#bac4b8]/70 hover:text-[#cc9933] transition-colors"
                >
                  <ExternalLink size={12} />
                  FULL RES
                </a>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: photo.fullTitle, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-mono text-[#cc9933] hover:underline cursor-pointer"
                >
                  <Share2 size={12} />
                  SHARE
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
