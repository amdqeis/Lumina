"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getExploreFeed } from "@/lib/api";
import { getSessionSeed } from "@/lib/auth";
import { CURATED_EXHIBITION, ExhibitionItem } from "@/lib/curatedExhibition";
import WebGLGalleryProvider from "@/src/components/canvas/WebGLGallery";
import HorizontalSlider from "@/src/components/gallery/HorizontalSlider";
import PhotoCard from "@/src/components/gallery/PhotoCard";
import EditorialNavbar from "@/src/components/layout/EditorialNavbar";
import PhotoDetailModal from "@/src/components/modal/PhotoDetailModal";
import AristideAboutModal from "./AristideAboutModal";
import AristideShowcase from "./AristideShowcase";
import AristideStrips from "./AristideStrips";
import { SlidersHorizontal, Grid, Film } from "lucide-react";

export default function AristideGallery() {
  const [items, setItems] = useState<ExhibitionItem[]>(CURATED_EXHIBITION);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"slider" | "showcase" | "strips">("slider");
  const [selectedPhoto, setSelectedPhoto] = useState<ExhibitionItem | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Fetch real photos dynamically from backend (/api/v1/explore/feed) if available
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
              imageUrl:
                p.thumbnail_url ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=85",
              year: "2026",
              type: "GOOGLE DRIVE",
              roleOrGear: "35MM SENSOR · RAW",
              clientOrArtist:
                p.photographer?.display_name?.toUpperCase() || "LUMINA ARCHIVE",
              description: `CLOUD ARCHIVE PHOTOGRAPH SYNCED DIRECTLY VIA GOOGLE DRIVE INTEGRATION.`,
              source: "google_drive",
            };
          });

          // Combine backend photos with curated exhibition items
          setItems([...mapped, ...CURATED_EXHIBITION]);
        }
      } catch (err) {
        console.warn("Using curated exhibition archive (backend offline or empty):", err);
      }
    }

    loadBackendPhotos();
  }, []);

  const total = items.length;
  const currentItem = items[activeIndex] || items[0];
  const nextItem = items[(activeIndex + 1) % total];
  const prevItem = items[(activeIndex - 1 + total) % total];

  const onNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const onPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const onSelect = useCallback((idx: number) => {
    setActiveIndex(idx);
  }, []);

  // Modal Next / Prev handlers
  const handleModalNext = useCallback(() => {
    if (!selectedPhoto) return;
    const currentIdx = items.findIndex((item) => item.id === selectedPhoto.id);
    const nextIdx = (currentIdx + 1) % total;
    setSelectedPhoto(items[nextIdx]);
    setActiveIndex(nextIdx);
  }, [items, selectedPhoto, total]);

  const handleModalPrev = useCallback(() => {
    if (!selectedPhoto) return;
    const currentIdx = items.findIndex((item) => item.id === selectedPhoto.id);
    const prevIdx = (currentIdx - 1 + total) % total;
    setSelectedPhoto(items[prevIdx]);
    setActiveIndex(prevIdx);
  }, [items, selectedPhoto, total]);

  return (
    <WebGLGalleryProvider>
      <main className="relative w-screen h-[100dvh] overflow-hidden flex flex-col justify-between select-none bg-[#141414] text-[#bac4b8]">
        {/* ─── Editorial Navbar with Aristide Ticks & Google Drive Connect ─── */}
        <EditorialNavbar
          total={total}
          current={activeIndex}
          onSelect={onSelect}
          onOpenAbout={() => setAboutOpen(true)}
        />

        {/* ─── Center Gallery Canvas Area with Generous Spacing ─── */}
        <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center pt-20 pb-16">
          <AnimatePresence mode="wait">
            {viewMode === "slider" ? (
              <motion.div
                key="webgl-slider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full"
              >
                <HorizontalSlider
                  itemCount={total}
                  activeIndex={activeIndex}
                  onActiveIndexChange={setActiveIndex}
                >
                  {items.map((photo, idx) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      index={idx}
                      isActive={idx === activeIndex}
                      onClick={(p) => setSelectedPhoto(p)}
                    />
                  ))}
                </HorizontalSlider>
              </motion.div>
            ) : viewMode === "showcase" ? (
              <motion.div
                key="showcase-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="flex-1 w-full h-full flex items-center justify-center relative overflow-hidden"
              >
                <AristideShowcase
                  item={currentItem}
                  nextItem={nextItem}
                  prevItem={prevItem}
                  onNext={onNext}
                  onPrev={onPrev}
                  theme="noir"
                />
              </motion.div>
            ) : (
              <motion.div
                key="strips-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="flex-1 w-full h-full flex items-center justify-center relative overflow-hidden"
              >
                <AristideStrips
                  items={items}
                  activeIndex={activeIndex}
                  onSelect={onSelect}
                  theme="noir"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Ambient Bottom Telemetry & View Mode Bar ─── */}
        <footer className="fixed bottom-0 left-0 right-0 z-30 px-8 py-5 md:px-16 flex items-center justify-between pointer-events-auto bg-gradient-to-t from-[#141414]/95 via-[#141414]/60 to-transparent">
          {/* Interaction hints with clearer font sizing */}
          <div className="flex items-center gap-4 text-xs font-mono tracking-[0.2em] text-[#bac4b8]/70 uppercase font-medium">
            <span className="hidden sm:inline">← → OR DRAG TO GLIDE</span>
            <span className="hidden sm:inline text-[#cc9933]">·</span>
            <span>CLICK TO EXPAND CINEMATIC VIEW</span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 bg-[#1c1c1c]/90 border border-[#bac4b8]/20 rounded-full p-1.5 backdrop-blur-lg shadow-xl">
            <button
              onClick={() => setViewMode("slider")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 cursor-pointer ${
                viewMode === "slider"
                  ? "bg-[#cc9933] text-black font-bold shadow-md"
                  : "text-[#bac4b8]/80 hover:text-white"
              }`}
            >
              <Film size={13} />
              <span>FLUID WEBGL</span>
            </button>
            <button
              onClick={() => setViewMode("showcase")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 cursor-pointer ${
                viewMode === "showcase"
                  ? "bg-[#cc9933] text-black font-bold shadow-md"
                  : "text-[#bac4b8]/80 hover:text-white"
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>SHOWCASE</span>
            </button>
            <button
              onClick={() => setViewMode("strips")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 cursor-pointer ${
                viewMode === "strips"
                  ? "bg-[#cc9933] text-black font-bold shadow-md"
                  : "text-[#bac4b8]/80 hover:text-white"
              }`}
            >
              <Grid size={13} />
              <span>STRIPS</span>
            </button>
          </div>
        </footer>

        {/* ─── Cinematic Detail Modal with Shared Element Expansion ─── */}
        <PhotoDetailModal
          photo={selectedPhoto}
          isOpen={selectedPhoto !== null}
          onClose={() => setSelectedPhoto(null)}
          onNext={handleModalNext}
          onPrev={handleModalPrev}
        />

        {/* ─── Aristide About Modal ─── */}
        <AristideAboutModal
          isOpen={aboutOpen}
          onClose={() => setAboutOpen(false)}
          theme="noir"
        />
      </main>
    </WebGLGalleryProvider>
  );
}
