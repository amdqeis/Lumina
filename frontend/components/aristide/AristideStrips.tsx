"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExhibitionItem } from "@/lib/curatedExhibition";

interface Props {
  items: ExhibitionItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  theme: "warm" | "noir";
}

export default function AristideStrips({
  items,
  activeIndex,
  onSelect,
  theme,
}: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isWarm = theme === "warm";

  return (
    <div className="relative flex-1 w-full flex items-center justify-center overflow-x-auto overflow-y-hidden px-4 md:px-12 py-4 select-none">
      <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 h-[58vh] md:h-[65vh] max-w-full">
        {items.map((item, idx) => {
          const isHovered = hoveredIndex === idx;
          const isActive = activeIndex === idx;
          const hasAnyHover = hoveredIndex !== null;
          const isDimmed = hasAnyHover && !isHovered;

          return (
            <motion.div
              key={item.id}
              layout
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSelect(idx)}
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: isDimmed ? 0.35 : 1,
                y: 0,
                width: isHovered
                  ? "min(280px, 35vw)"
                  : isActive
                  ? "min(140px, 18vw)"
                  : "min(72px, 9vw)",
              }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 32,
              }}
              className={`relative h-full flex-shrink-0 cursor-pointer overflow-hidden border transition-colors duration-300 ${
                isHovered
                  ? isWarm
                    ? "border-[#C59A3F] shadow-xl"
                    : "border-white shadow-2xl"
                  : isActive
                  ? isWarm
                    ? "border-[#C59A3F]/60"
                    : "border-white/50"
                  : isWarm
                  ? "border-black/10"
                  : "border-white/10"
              }`}
            >
              {/* Sliced Photograph */}
              <motion.img
                src={item.imageUrl}
                alt={item.fullTitle}
                animate={{
                  scale: isHovered ? 1.08 : 1,
                  filter: isHovered
                    ? "grayscale(70%) contrast(120%)"
                    : "grayscale(100%) contrast(110%)",
                }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover pointer-events-none select-none"
              />

              {/* Gradient overlay for readability */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
                  isHovered
                    ? "bg-gradient-to-t from-black/80 via-transparent to-black/30"
                    : "bg-black/20"
                }`}
              />

              {/* Strip Index Number (Top) */}
              <div className="absolute top-3 left-3 z-10 font-mono text-[10px] tracking-widest text-white/80">
                {item.index}
              </div>

              {/* Hover Details: Title, Client/Artist, View Prompt */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.25 }}
                  className="absolute bottom-3 left-3 right-3 z-10 flex flex-col gap-1 text-white"
                >
                  <span className="font-display text-lg sm:text-xl font-bold tracking-wider uppercase leading-none">
                    {item.fullTitle}
                  </span>
                  <span className="font-mono text-[9px] tracking-wider text-white/70 truncate">
                    {item.clientOrArtist}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[8px] tracking-widest text-[#C59A3F] mt-1 uppercase">
                    <span>CLICK TO EXPAND</span>
                    <span>→</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
