"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getGoogleOAuthURL } from "@/lib/auth";
import { LogIn, LogOut, LayoutDashboard, Settings } from "lucide-react";

interface Props {
  total: number;
  current: number;
  onSelect: (index: number) => void;
  viewMode: "showcase" | "strips";
  onToggleView: () => void;
  theme: "warm" | "noir";
  onToggleTheme: () => void;
  onOpenAbout: () => void;
}

export default function AristideNavbar({
  total,
  current,
  onSelect,
  viewMode,
  onToggleView,
  theme,
  onToggleTheme,
  onOpenAbout,
}: Props) {
  const { user, logout } = useAuth();
  const isWarm = theme === "warm";

  // Create an array of 28 tick marks for the scrubber track
  const TICK_COUNT = 24;
  const currentRatio = total > 1 ? current / (total - 1) : 0;
  const activeTickIndex = Math.round(currentRatio * (TICK_COUNT - 1));

  return (
    <header className="relative z-40 w-full px-6 md:px-12 pt-6 md:pt-8 flex items-center justify-between select-none">
      {/* ─── Left: Brand Logo ────────────────── */}
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className={`font-display text-2xl md:text-3xl tracking-[0.08em] font-bold uppercase transition-colors duration-300 ${
            isWarm ? "text-[#C59A3F] hover:text-[#a87f2a]" : "text-[#BAC4B8] hover:text-white"
          }`}
        >
          LUMINA
        </Link>
      </div>

      {/* ─── Center: Aristide Pagination & Scrubber ─── */}
      <div className="hidden sm:flex items-center gap-4">
        {/* Counter: e.g. 01 [ — ] 08 */}
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest">
          <span
            className={`font-bold transition-colors ${
              isWarm ? "text-[#C59A3F]" : "text-white"
            }`}
          >
            {String(current + 1).padStart(2, "0")}
          </span>

          {/* Interactive scrubber thumb indicator */}
          <div
            className={`relative w-8 h-4 border flex items-center justify-center transition-colors ${
              isWarm ? "border-[#C59A3F]/50 bg-[#C59A3F]/10" : "border-white/40 bg-white/10"
            }`}
          >
            <motion.div
              layout
              className={`w-3 h-[2px] ${isWarm ? "bg-[#C59A3F]" : "bg-white"}`}
            />
          </div>

          <span
            className={`transition-colors ${
              isWarm ? "text-[#C59A3F]" : "text-[#7B8479]"
            }`}
          >
            {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* Vertical Ticks Scrubber: | | | | | | | | | | | | | */}
        <div className="flex items-center gap-[4px] px-2 py-1 cursor-pointer">
          {Array.from({ length: TICK_COUNT }).map((_, idx) => {
            const isActive = idx === activeTickIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const targetIndex = Math.min(
                    total - 1,
                    Math.round((idx / (TICK_COUNT - 1)) * (total - 1))
                  );
                  onSelect(targetIndex);
                }}
                className="group p-0 h-4 flex items-center justify-center focus:outline-none"
                title={`Jump to item ${Math.round((idx / (TICK_COUNT - 1)) * (total - 1)) + 1}`}
              >
                <div
                  className={`w-[1px] transition-all duration-200 ${
                    isActive
                      ? isWarm
                        ? "h-4 bg-[#C59A3F]"
                        : "h-4 bg-white"
                      : isWarm
                      ? "h-2.5 bg-[#C59A3F]/35 group-hover:h-3.5 group-hover:bg-[#C59A3F]"
                      : "h-2.5 bg-[#525750] group-hover:h-3.5 group-hover:bg-[#BAC4B8]"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Right: Navigation & Controls ─── */}
      <div className="flex items-center gap-4 md:gap-8 font-mono text-[10px] md:text-[11px] tracking-[0.2em] uppercase">
        {/* View Mode Toggle: STRIPS vs SHOWCASE */}
        <button
          onClick={onToggleView}
          className={`hidden md:block transition-colors duration-300 underline-offset-4 hover:underline ${
            isWarm
              ? "text-[#1C1B18]/70 hover:text-[#1C1B18]"
              : "text-[#BAC4B8]/70 hover:text-white"
          }`}
          title="Toggle Overview Slits / Cinematic Showcase"
        >
          {viewMode === "showcase" ? "[ STRIPS ]" : "[ SHOWCASE ]"}
        </button>

        {/* Theme Toggle: WARM vs NOIR */}
        <button
          onClick={onToggleTheme}
          className={`hidden lg:block transition-colors duration-300 underline-offset-4 hover:underline ${
            isWarm
              ? "text-[#1C1B18]/70 hover:text-[#1C1B18]"
              : "text-[#BAC4B8]/70 hover:text-white"
          }`}
          title="Toggle Warm Linen / Matte Noir Palette"
        >
          {isWarm ? "[ NOIR ]" : "[ WARM ]"}
        </button>

        {/* ABOUT Button */}
        <button
          onClick={onOpenAbout}
          className={`transition-colors duration-300 underline-offset-4 border-b pb-[2px] ${
            isWarm
              ? "border-[#C59A3F] text-[#C59A3F] hover:text-[#1C1B18] hover:border-[#1C1B18]"
              : "border-white/50 text-white hover:border-white"
          }`}
        >
          ABOUT
        </button>

        {/* Auth / Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                title="Go to Dashboard"
                className={`transition-colors ${
                  isWarm ? "text-[#1C1B18] hover:text-[#C59A3F]" : "text-white hover:text-[#C59A3F]"
                }`}
              >
                <LayoutDashboard size={14} />
              </Link>
              <Link
                href="/settings"
                title="Settings"
                className={`transition-colors ${
                  isWarm ? "text-[#1C1B18] hover:text-[#C59A3F]" : "text-white hover:text-[#C59A3F]"
                }`}
              >
                <Settings size={14} />
              </Link>
              <button
                onClick={logout}
                title="Sign out"
                className={`transition-colors ${
                  isWarm ? "text-[#1C1B18]/60 hover:text-[#1C1B18]" : "text-white/60 hover:text-white"
                }`}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <a
              href={getGoogleOAuthURL()}
              className={`flex items-center gap-1.5 transition-colors border px-2.5 py-1 ${
                isWarm
                  ? "border-[#C59A3F]/50 text-[#C59A3F] hover:bg-[#C59A3F] hover:text-white"
                  : "border-white/30 text-white hover:border-white"
              }`}
            >
              <LogIn size={11} />
              <span className="hidden sm:inline">SIGN IN</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
