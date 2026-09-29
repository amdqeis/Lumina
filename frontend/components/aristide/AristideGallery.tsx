"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getExploreFeed } from "@/lib/api";
import { getSessionSeed } from "@/lib/auth";
import { CURATED_EXHIBITION, ExhibitionItem } from "@/lib/curatedExhibition";
import AristideNavbar from "./AristideNavbar";
import AristideShowcase from "./AristideShowcase";
import AristideStrips from "./AristideStrips";
import AristideBottomBar from "./AristideBottomBar";
import AristideAboutModal from "./AristideAboutModal";

export default function AristideGallery() {
  const [items, setItems] = useState<ExhibitionItem[]>(CURATED_EXHIBITION);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"showcase" | "strips">("showcase");
  const [theme, setTheme] = useState<"warm" | "noir">("warm");
  const [aboutOpen, setAboutOpen] = useState(false);
  const lastWheelTime = useRef(0);

  // Fetch real photos from backend if available
  useEffect(() => {
    async function loadBackendPhotos() {
      try {
        const seed = getSessionSeed();
        const data = await getExploreFeed(seed, 30);
        if (data && data.photos && data.photos.length > 0) {
          const mapped: ExhibitionItem[] = data.photos.map((p, i) => {
            const rawTitle = (p.title || "EXHIBITION PHOTO").toUpperCase();
            const words = rawTitle.split(" ");
            const mid = Math.ceil(words.length / 2);
            const top = words.slice(0, mid).join("   ");
            const bottom = words.slice(mid).join("   ") || top;

            return {
              id: p.id,
              index: String(i + 1).padStart(2, "0"),
              titleTop: top,
              titleBottom: bottom,
              fullTitle: rawTitle,
              imageUrl: p.thumbnail_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=85",
              year: "2026",
              type: "GOOGLE DRIVE",
              roleOrGear: "35MM SENSOR · RAW",
              clientOrArtist: p.photographer?.display_name?.toUpperCase() || "LUMINA ARCHIVE",
              description: `CLOUD ARCHIVE PHOTOGRAPH SYNCED DIRECTLY VIA GOOGLE DRIVE.`,
              source: "google_drive",
            };
          });

          // Combine real photos with curated ones
          setItems([...mapped, ...CURATED_EXHIBITION]);
        }
      } catch (err) {
        console.warn("Could not load backend photos, displaying curated archive:", err);
      }
    }

    loadBackendPhotos();
  }, []);

  const total = items.length;

  const onNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const onPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const onSelect = useCallback((idx: number) => {
    setActiveIndex(idx);
    setViewMode("showcase");
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (aboutOpen) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        onPrev();
      } else if (e.key === " ") {
        e.preventDefault();
        setViewMode((m) => (m === "showcase" ? "strips" : "showcase"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [aboutOpen, onNext, onPrev]);

  // Wheel navigation with debounce
  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode === "strips") return;
    const now = Date.now();
    if (now - lastWheelTime.current < 450) return;

    if (Math.abs(e.deltaX) > 30 || Math.abs(e.deltaY) > 30) {
      if (e.deltaX > 30 || e.deltaY > 30) {
        lastWheelTime.current = now;
        onNext();
      } else if (e.deltaX < -30 || e.deltaY < -30) {
        lastWheelTime.current = now;
        onPrev();
      }
    }
  };

  const currentItem = items[activeIndex] || items[0];
  const nextItem = items[(activeIndex + 1) % total];
  const prevItem = items[(activeIndex - 1 + total) % total];

  const isWarm = theme === "warm";

  return (
    <motion.main
      onWheel={handleWheel}
      animate={{
        backgroundColor: isWarm ? "#ECEAE5" : "#0E0F0E",
        color: isWarm ? "#1C1B18" : "#BAC4B8",
      }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-screen h-[100dvh] overflow-hidden flex flex-col justify-between select-none"
    >
      {/* ─── Top Bar: Navbar with Aristide Ticks & Scrubber ─── */}
      <AristideNavbar
        total={total}
        current={activeIndex}
        onSelect={onSelect}
        viewMode={viewMode}
        onToggleView={() =>
          setViewMode((m) => (m === "showcase" ? "strips" : "showcase"))
        }
        theme={theme}
        onToggleTheme={() =>
          setTheme((t) => (t === "warm" ? "noir" : "warm"))
        }
        onOpenAbout={() => setAboutOpen(true)}
      />

      {/* ─── Center Canvas: Showcase or Strips View ─── */}
      <AnimatePresence mode="wait">
        {viewMode === "showcase" ? (
          <motion.div
            key="showcase-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="flex-1 w-full flex items-center justify-center relative overflow-hidden"
          >
            <AristideShowcase
              item={currentItem}
              nextItem={nextItem}
              prevItem={prevItem}
              onNext={onNext}
              onPrev={onPrev}
              theme={theme}
            />
          </motion.div>
        ) : (
          <motion.div
            key="strips-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="flex-1 w-full flex items-center justify-center relative overflow-hidden"
          >
            <AristideStrips
              items={items}
              activeIndex={activeIndex}
              onSelect={onSelect}
              theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Bottom Row: Metadata, Explore Trigger, Story ─── */}
      <AristideBottomBar item={currentItem} theme={theme} />

      {/* ─── About Drawer / Modal ─── */}
      <AristideAboutModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
        theme={theme}
      />
    </motion.main>
  );
}
