"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWebGLGallery } from "@/src/components/canvas/WebGLGallery";
import { ExhibitionItem } from "@/lib/curatedExhibition";
import { FeedPhoto } from "@/lib/api";

export type CompatiblePhoto = (ExhibitionItem | FeedPhoto) & {
  fullTitle?: string;
  year?: string;
  roleOrGear?: string;
  clientOrArtist?: string;
  description?: string;
  imageUrl?: string;
  index?: string | number;
  type?: string;
};

interface PhotoCardProps {
  photo: CompatiblePhoto;
  index?: number;
  isActive?: boolean;
  onClick?: (photo: any) => void;
}

export default function PhotoCard({
  photo,
  index = 0,
  isActive = false,
  onClick,
}: PhotoCardProps) {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { registerCard, unregisterCard, setCardHover } = useWebGLGallery();
  const [clicked, setClicked] = useState(false);

  // Safely extract properties across union types
  const photoId = photo.id;
  const rawThumb = "thumbnail_url" in photo ? photo.thumbnail_url : null;
  const rawImg = "imageUrl" in photo ? photo.imageUrl : null;
  const imageUrl =
    rawImg ||
    (rawThumb ? rawThumb.replace(/=s\d+/, "=s1400") : null) ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=85";

  const rawFullTitle = "fullTitle" in photo ? photo.fullTitle : null;
  const rawTitle = "title" in photo ? photo.title : null;
  const title = rawFullTitle || rawTitle || "UNTITLED COMPOSITION";

  const rawPhotographer = "photographer" in photo ? photo.photographer : null;
  const rawArtist = "clientOrArtist" in photo ? photo.clientOrArtist : null;
  const artist =
    rawArtist ||
    rawPhotographer?.display_name ||
    rawPhotographer?.username ||
    "LUMINA ARCHIVE";

  const year = "year" in photo && photo.year ? photo.year : "2026";
  const gear =
    "roleOrGear" in photo && photo.roleOrGear
      ? photo.roleOrGear
      : "SONY A7 IV · FE 85MM F1.4 · 1/500s · ISO 100";

  const displayIndex =
    typeof photo.index === "string"
      ? photo.index
      : typeof photo.index === "number"
      ? String(photo.index + 1).padStart(2, "0")
      : String(index + 1).padStart(2, "0");

  const category = "type" in photo && photo.type ? photo.type : "FINE ART";

  // Register image container with WebGL Plane mesh for fluid wave distortion
  useEffect(() => {
    const el = imageContainerRef.current;
    if (!el || !registerCard) return;
    registerCard(photoId, el, imageUrl);
    return () => {
      if (unregisterCard) unregisterCard(photoId);
    };
  }, [photoId, imageUrl, registerCard, unregisterCard]);

  // Asymmetric editorial aspect ratios
  const aspectRatios = [
    "aspect-[4/5] w-[280px] sm:w-[360px] md:w-[440px] lg:w-[460px]",    // Portrait
    "aspect-[16/10] w-[360px] sm:w-[480px] md:w-[600px] lg:w-[660px]",  // Cinematic
    "aspect-[3/4] w-[260px] sm:w-[330px] md:w-[400px] lg:w-[430px]",    // Tall editorial
    "aspect-[3/2] w-[340px] sm:w-[460px] md:w-[560px] lg:w-[620px]",    // 35mm ratio
  ];
  const aspectClass = aspectRatios[index % aspectRatios.length];

  const handleClick = () => {
    if (!onClick) return;
    // Shutter flash effect before expanding
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
      onClick(photo);
    }, 180);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setCardHover && setCardHover(photoId, true)}
      onMouseLeave={() => setCardHover && setCardHover(photoId, false)}
      className="flex flex-col flex-shrink-0 group cursor-pointer transition-all duration-700 hover:-translate-y-2 select-none"
    >
      {/* ─── Top Index & Category Bar ─── */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#bac4b8]/15 text-[11px] font-mono tracking-[0.25em] text-[#bac4b8]/70 uppercase">
        <span className="font-semibold text-[#cc9933]">[{displayIndex}]</span>
        <span className="text-[#cc9933]/80 tracking-[0.2em]">{category}</span>
      </div>

      {/* ─── Image with Shared Element layoutId ─── */}
      <motion.div
        layoutId={`photo-box-${photoId}`}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        ref={imageContainerRef}
        className={`relative ${aspectClass} overflow-hidden bg-[#181818] border border-[#bac4b8]/12 shadow-xl transition-all duration-700 group-hover:border-[#cc9933]/50 group-hover:shadow-[0_24px_60px_rgba(0,0,0,0.85)]`}
      >
        <motion.img
          layoutId={`photo-img-${photoId}`}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          loading="eager"
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none opacity-50 group-hover:opacity-15 transition-opacity duration-700" />

        {/* Click flash — Aristide shutter effect */}
        <AnimatePresence>
          {clicked && (
            <motion.div
              key="flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0 bg-white pointer-events-none z-10"
            />
          )}
        </AnimatePresence>

        {/* Expand hint on hover */}
        <div className="absolute bottom-3.5 right-3.5 w-8 h-8 flex items-center justify-center border border-white/25 bg-black/40 backdrop-blur-sm text-white/70 text-[9px] font-mono z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          ↗
        </div>
      </motion.div>

      {/* ─── Editorial Metadata ─── */}
      <div className="mt-5 md:mt-6 flex flex-col gap-2 max-w-[600px]">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-xl sm:text-2xl font-medium tracking-wide text-white group-hover:text-[#cc9933] transition-colors leading-tight">
            {title}
          </h3>
          <span className="font-mono text-[11px] text-[#bac4b8]/50 tracking-widest whitespace-nowrap">
            {year}
          </span>
        </div>

        <div className="text-[11px] sm:text-xs font-mono tracking-[0.2em] text-[#bac4b8]/70 uppercase">
          {artist}
        </div>

        <div className="mt-2 pt-2.5 border-t border-[#bac4b8]/12 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#cc9933] shadow-[0_0_6px_#cc9933] animate-pulse flex-shrink-0" />
          <span className="font-mono text-[10px] sm:text-[11px] tracking-widest text-[#bac4b8]/60 uppercase truncate">
            {gear}
          </span>
        </div>
      </div>
    </div>
  );
}
