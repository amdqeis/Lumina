"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Cloud, User as UserIcon, Settings } from "lucide-react";

interface EditorialNavbarProps {
  total: number;
  current: number;
  onSelect?: (index: number) => void;
  onOpenAbout?: () => void;
}

export default function EditorialNavbar({
  total,
  current,
  onSelect,
  onOpenAbout,
}: EditorialNavbarProps) {
  const { user, isLoading } = useAuth();

  const currentIndexStr = String(current + 1).padStart(2, "0");
  const totalStr = String(total).padStart(2, "0");

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-8 py-5 md:px-16 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-[#141414]/95 via-[#141414]/60 to-transparent backdrop-blur-[4px]">
      {/* ─── Brand Logo ─── */}
      <div className="flex items-baseline gap-4">
        <Link href="/" className="group flex items-baseline gap-2.5">
          <span className="font-serif text-xl md:text-2xl tracking-[0.25em] font-semibold text-white group-hover:text-[#cc9933] transition-colors">
            LUMINA
          </span>
          <span className="text-[9px] font-mono tracking-[0.3em] text-[#cc9933] uppercase font-bold hidden sm:inline">
            ARCHIVE
          </span>
        </Link>
      </div>

      {/* ─── Aristide Benoist Pagination Ticks & Scrubber ─── */}
      <div className="hidden sm:flex items-center gap-3">
        <span className="font-mono text-sm text-[#cc9933] tracking-widest font-bold">
          {currentIndexStr}
        </span>

        <div className="flex items-center gap-[4px] px-2 py-1.5">
          {Array.from({ length: Math.min(total, 24) }).map((_, idx) => {
            const mappedIdx = Math.round((idx / (Math.min(total, 24) - 1)) * (total - 1));
            const isActive = idx === Math.round((current / (total - 1)) * (Math.min(total, 24) - 1));
            return (
              <button
                key={idx}
                onClick={() => onSelect && onSelect(mappedIdx)}
                aria-label={`Go to slide ${mappedIdx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? "h-5 w-[2px] bg-[#cc9933] shadow-[0_0_6px_#cc9933]"
                    : "h-2.5 w-[1px] bg-[#bac4b8]/30 hover:bg-[#bac4b8]/70 hover:h-4"
                }`}
              />
            );
          })}
        </div>

        <span className="font-mono text-sm text-[#bac4b8]/60 tracking-widest">
          {totalStr}
        </span>
      </div>

      {/* ─── Right Controls ─── */}
      <div className="flex items-center gap-5 md:gap-7">
        <Link
          href="/explore"
          className="text-[11px] md:text-xs font-mono tracking-[0.2em] uppercase text-[#bac4b8]/80 hover:text-white transition-colors hidden md:block"
        >
          Explore
        </Link>

        {onOpenAbout && (
          <button
            onClick={onOpenAbout}
            className="text-[11px] md:text-xs font-mono tracking-[0.2em] uppercase text-[#bac4b8]/80 hover:text-white transition-colors cursor-pointer hidden sm:block"
          >
            About
          </button>
        )}

        {/* Auth / Profile */}
        {isLoading ? (
          <div className="w-24 h-8 rounded bg-[#1e1e1e] animate-pulse" />
        ) : user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 border border-[#bac4b8]/15 bg-[#1e1e1e]/60 hover:bg-[#1e1e1e] hover:border-[#cc9933]/50 transition-all text-[11px] font-mono tracking-wider text-[#bac4b8]"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.display_name || "User"}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <UserIcon size={13} className="text-[#cc9933]" />
              )}
              <span className="truncate max-w-[90px] hidden sm:inline font-medium">
                {user.display_name || "Dashboard"}
              </span>
            </Link>
            <Link
              href="/settings"
              title="Profile & Settings"
              className="flex items-center p-2 border border-[#bac4b8]/15 bg-[#1e1e1e]/60 hover:bg-[#1e1e1e] hover:border-[#cc9933]/50 hover:text-[#cc9933] transition-all text-[#bac4b8]"
            >
              <Settings size={13} />
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 border border-[#cc9933]/50 bg-[#cc9933]/10 hover:bg-[#cc9933]/20 hover:border-[#cc9933] transition-all duration-300 text-[11px] font-mono tracking-wider text-[#cc9933] font-semibold"
          >
            <Cloud size={13} />
            <span className="hidden sm:inline">SIGN IN</span>
          </Link>
        )}
      </div>
    </header>
  );
}
