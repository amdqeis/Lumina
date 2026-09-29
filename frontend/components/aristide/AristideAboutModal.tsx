"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getGoogleOAuthURL } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { X, ArrowUpRight, Cloud, Sparkles, ShieldCheck } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  theme: "warm" | "noir";
}

export default function AristideAboutModal({ isOpen, onClose, theme }: Props) {
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const isWarm = theme === "warm";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed inset-0 ${
              isWarm ? "bg-[#181715]/60" : "bg-black/80"
            } backdrop-blur-md`}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`relative z-10 w-full max-w-4xl border p-8 md:p-14 shadow-2xl ${
              isWarm
                ? "bg-[#ECEAE5] border-[#1C1B18]/15 text-[#1C1B18]"
                : "bg-[#0E0F0E] border-white/15 text-[#BAC4B8]"
            }`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className={`absolute top-6 right-6 md:top-8 md:right-8 p-2 rounded-full border transition-all duration-300 ${
                isWarm
                  ? "border-[#1C1B18]/20 hover:border-[#1C1B18] text-[#1C1B18]"
                  : "border-white/20 hover:border-white text-white"
              }`}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="mb-10">
              <span
                className={`font-mono text-[10px] tracking-[0.25em] uppercase block mb-3 ${
                  isWarm ? "text-[#C59A3F]" : "text-[#C59A3F]"
                }`}
              >
                [ COLOPHON & ARCHITECTURE ]
              </span>
              <h2
                className={`font-display text-5xl md:text-7xl font-bold tracking-tight uppercase leading-[0.9] ${
                  isWarm ? "text-[#1C1B18]" : "text-white"
                }`}
              >
                LUMINA GALLERY
              </h2>
              <p
                className={`mt-4 font-sans text-sm md:text-base leading-relaxed max-w-2xl ${
                  isWarm ? "text-[#625E56]" : "text-[#8E968C]"
                }`}
              >
                An ultra-high-definition, cloud-native exhibition platform.
                Lumina connects photographers directly to their Google Drive
                archives — eliminating re-uploading, avoiding aggressive social
                media compression, and celebrating visual purity.
              </p>
            </div>

            {/* Architecture Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10 py-8 border-y border-current/10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <Cloud size={16} className="text-[#C59A3F]" />
                  <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
                    01. Zero-Store Sync
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isWarm ? "text-[#625E56]" : "text-[#8E968C]"
                  }`}
                >
                  We stream high-fidelity thumbnails directly from your Google
                  Drive. We never duplicate or store your original master files.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-[#C59A3F]" />
                  <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
                    02. Diverse Shuffle
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isWarm ? "text-[#625E56]" : "text-[#8E968C]"
                  }`}
                >
                  Our seeded weighted shuffle guarantees equitable exposure for
                  every artist across every session, not just prolific uploads.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={16} className="text-[#C59A3F]" />
                  <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
                    03. Pure EXIF Optics
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isWarm ? "text-[#625E56]" : "text-[#8E968C]"
                  }`}
                >
                  Focal length, aperture, shutter speed, ISO, and camera sensor
                  metadata are extracted organically and presented with reverence.
                </p>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
              <div className="flex items-center gap-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-[#C59A3F] text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#d6a94b] transition-colors flex items-center gap-2"
                  >
                    Open Dashboard <ArrowUpRight size={14} />
                  </Link>
                ) : (
                  <a
                    href={getGoogleOAuthURL()}
                    className="px-6 py-3 bg-[#C59A3F] text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#d6a94b] transition-colors flex items-center gap-2"
                  >
                    Sign in with Google <ArrowUpRight size={14} />
                  </a>
                )}
                <Link
                  href="/explore"
                  className={`px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-colors ${
                    isWarm
                      ? "border-[#1C1B18]/30 hover:border-[#1C1B18] text-[#1C1B18]"
                      : "border-white/30 hover:border-white text-white"
                  }`}
                >
                  Full Archive Grid
                </Link>
              </div>

              <div className="flex items-center gap-6 font-mono text-[10px] tracking-widest uppercase opacity-60">
                <span>EST. 2026</span>
                <span>FASTAPI / NEXT.JS</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
