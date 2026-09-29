"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExhibitionItem } from "@/lib/curatedExhibition";

interface Props {
  item: ExhibitionItem;
  theme: "warm" | "noir";
}

export default function AristideBottomBar({ item, theme }: Props) {
  const isWarm = theme === "warm";

  return (
    <footer className="relative z-30 w-full px-6 md:px-12 pb-6 md:pb-8 flex flex-col gap-6 select-none">
      {/* ─── Upper Row: 4-Column Metadata + Center Action + Story ─── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        {/* Left Column: A, B, C, D Metadata Grid (4 cols on desktop) */}
        <div className="md:col-span-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-2 gap-y-2 gap-x-6 font-mono text-[9px] md:text-[10px] tracking-[0.16em] uppercase">
          <div className="flex items-baseline gap-2">
            <span className={isWarm ? "text-[#C59A3F]" : "text-[#7B8479]"}>A</span>
            <span className={isWarm ? "text-[#767267]" : "text-[#7B8479]"}>YEAR</span>
            <span className={`font-semibold ml-auto sm:ml-0 ${isWarm ? "text-[#1C1B18]" : "text-[#BAC4B8]"}`}>
              {item.year}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={isWarm ? "text-[#C59A3F]" : "text-[#7B8479]"}>B</span>
            <span className={isWarm ? "text-[#767267]" : "text-[#7B8479]"}>TYPE</span>
            <span className={`font-semibold ml-auto sm:ml-0 ${isWarm ? "text-[#1C1B18]" : "text-[#BAC4B8]"}`}>
              {item.type}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={isWarm ? "text-[#C59A3F]" : "text-[#7B8479]"}>C</span>
            <span className={isWarm ? "text-[#767267]" : "text-[#7B8479]"}>GEAR</span>
            <span className={`font-semibold truncate ml-auto sm:ml-0 ${isWarm ? "text-[#1C1B18]" : "text-[#BAC4B8]"}`}>
              {item.roleOrGear}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={isWarm ? "text-[#C59A3F]" : "text-[#7B8479]"}>D</span>
            <span className={isWarm ? "text-[#767267]" : "text-[#7B8479]"}>SOURCE</span>
            <span className={`font-semibold truncate ml-auto sm:ml-0 ${isWarm ? "text-[#1C1B18]" : "text-[#BAC4B8]"}`}>
              {item.clientOrArtist}
            </span>
          </div>
        </div>

        {/* Center: EXPLORE Action with Vertical Stem (2 cols on desktop) */}
        <div className="hidden md:flex md:col-span-2 flex-col items-center justify-center text-center">
          <Link
            href="/explore"
            className="group flex flex-col items-center focus:outline-none"
          >
            <span
              className={`font-mono text-[10px] tracking-[0.25em] uppercase font-bold transition-colors ${
                isWarm ? "text-[#C59A3F] group-hover:text-[#9A7324]" : "text-[#C59A3F] group-hover:text-white"
              }`}
            >
              EXPLORE
            </span>
            <div
              className={`w-[1px] h-5 my-1 transition-all duration-300 group-hover:h-7 ${
                isWarm ? "bg-[#C59A3F]" : "bg-[#C59A3F]"
              }`}
            />
            <span
              className={`text-[8px] transform transition-transform group-hover:translate-y-1 ${
                isWarm ? "text-[#C59A3F]" : "text-[#C59A3F]"
              }`}
            >
              ▼
            </span>
          </Link>
        </div>

        {/* Right: Narrative Description (5 cols on desktop) */}
        <div className="md:col-span-5 flex md:justify-end text-left md:text-right">
          <p
            className={`font-mono text-[9px] md:text-[10px] tracking-[0.14em] uppercase leading-relaxed max-w-md ${
              isWarm ? "text-[#767267]" : "text-[#7B8479]"
            }`}
          >
            {item.description}
          </p>
        </div>
      </div>

      {/* ─── Bottom-most Subfooter Line ─── */}
      <div
        className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[9px] tracking-[0.2em] uppercase ${
          isWarm
            ? "border-[#1C1B18]/10 text-[#767267]"
            : "border-white/10 text-[#5F675D]"
        }`}
      >
        <div className="flex items-center gap-4">
          <span>INDEPENDENT PHOTOGRAPHY GATEWAY</span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline">GOOGLE DRIVE ARCHIVE</span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/explore"
            className={`transition-colors hover:underline ${
              isWarm ? "hover:text-[#1C1B18]" : "hover:text-white"
            }`}
          >
            EXPLORE
          </Link>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors hover:underline ${
              isWarm ? "hover:text-[#1C1B18]" : "hover:text-white"
            }`}
          >
            INSTAGRAM
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors hover:underline ${
              isWarm ? "hover:text-[#1C1B18]" : "hover:text-white"
            }`}
          >
            TWITTER
          </a>
        </div>
      </div>
    </footer>
  );
}
