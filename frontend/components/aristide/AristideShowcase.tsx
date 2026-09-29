"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExhibitionItem } from "@/lib/curatedExhibition";

interface Props {
  item: ExhibitionItem;
  nextItem: ExhibitionItem;
  prevItem: ExhibitionItem;
  onNext: () => void;
  onPrev: () => void;
  theme: "warm" | "noir";
}

export default function AristideShowcase({
  item,
  nextItem,
  prevItem,
  onNext,
  onPrev,
  theme,
}: Props) {
  const isWarm = theme === "warm";
  const dragThreshold = 50;

  return (
    <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden px-4 md:px-12 select-none">
      {/* ─── Layer 1: Giant Background Typography ─── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 1.02 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center justify-center text-center leading-[0.82] select-none"
          >
            {/* Top Headline: e.g. "H O U S E   O F" */}
            <span
              className={`font-display font-bold tracking-[0.16em] md:tracking-[0.24em] text-[13vw] sm:text-[14vw] md:text-[13vw] lg:text-[13.5vw] uppercase block ${
                isWarm ? "text-[#C59A3F]" : "text-[#C59A3F]"
              }`}
              style={{
                textShadow: isWarm
                  ? "0 0 1px rgba(197, 154, 63, 0.4)"
                  : "0 0 20px rgba(197, 154, 63, 0.15)",
              }}
            >
              {item.titleTop}
            </span>

            {/* Bottom Headline: e.g. "G U C C I" */}
            <span
              className={`font-display font-bold tracking-[0.18em] md:tracking-[0.28em] text-[13vw] sm:text-[14vw] md:text-[13vw] lg:text-[13.5vw] uppercase block mt-[-1vw] md:mt-[-1.5vw] ${
                isWarm ? "text-[#C59A3F]" : "text-[#C59A3F]"
              }`}
            >
              {item.titleBottom}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Layer 2: Main Image Card & Carousel Peeks ─── */}
      <div className="relative z-10 w-full max-w-7xl flex items-center justify-center">
        {/* Previous Image Peek (Left Side) */}
        <motion.div
          onClick={onPrev}
          whileHover={{ scale: 1.03 }}
          className="absolute -left-[35%] sm:-left-[20%] md:-left-[12%] lg:-left-[8%] top-1/2 -translate-y-1/2 hidden md:block cursor-pointer z-20 group"
          title={`Previous: ${prevItem.fullTitle}`}
        >
          <div className="w-[18vw] max-w-[260px] aspect-[16/10] overflow-hidden border border-black/10 dark:border-white/10 shadow-lg relative opacity-40 group-hover:opacity-80 transition-opacity duration-300">
            <img
              src={prevItem.imageUrl}
              alt={prevItem.fullTitle}
              className="w-full h-full object-cover grayscale contrast-125"
            />
          </div>
        </motion.div>

        {/* Active Featured Image Card (Center Stage) */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -dragThreshold) {
              onNext();
            } else if (info.offset.x > dragThreshold) {
              onPrev();
            }
          }}
          className="relative z-20 cursor-grab active:cursor-grabbing w-[86vw] sm:w-[72vw] md:w-[50vw] lg:w-[46vw] max-w-[680px]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className={`relative aspect-[16/10] md:aspect-[3/2] overflow-hidden shadow-2xl border ${
                isWarm ? "border-black/15 bg-[#E2DFD8]" : "border-white/15 bg-[#141514]"
              }`}
            >
              <img
                src={item.imageUrl}
                alt={item.fullTitle}
                className="w-full h-full object-cover grayscale contrast-[1.18] brightness-95"
                draggable={false}
              />

              {/* Subtle vignette/sheen */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 pointer-events-none" />

              {/* Corner badge on mobile */}
              <div className="absolute bottom-3 left-3 md:hidden font-mono text-[9px] tracking-widest uppercase bg-black/60 text-white px-2 py-1 backdrop-blur-sm">
                {item.fullTitle}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Next Image Peek (Right Side) - Matching Aristide Screenshot 2! */}
        <motion.div
          onClick={onNext}
          whileHover={{ scale: 1.03 }}
          className="absolute -right-[35%] sm:-right-[20%] md:-right-[12%] lg:-right-[8%] top-1/2 -translate-y-1/2 hidden md:block cursor-pointer z-20 group"
          title={`Next: ${nextItem.fullTitle}`}
        >
          <div className="w-[18vw] max-w-[260px] aspect-[16/10] overflow-hidden border border-black/10 dark:border-white/10 shadow-lg relative opacity-50 group-hover:opacity-90 transition-opacity duration-300">
            <img
              src={nextItem.imageUrl}
              alt={nextItem.fullTitle}
              className="w-full h-full object-cover grayscale contrast-125"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
