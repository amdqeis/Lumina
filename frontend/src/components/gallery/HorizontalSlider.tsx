"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useWebGLGallery } from "@/src/components/canvas/WebGLGallery";

interface HorizontalSliderProps {
  children: ReactNode;
  itemCount: number;
  activeIndex: number;
  onActiveIndexChange?: (index: number) => void;
  className?: string;
}

export default function HorizontalSlider({
  children,
  itemCount,
  activeIndex,
  onActiveIndexChange,
  className = "",
}: HorizontalSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { setVelocity, setMouse } = useWebGLGallery();

  // Physics state
  const physics = useRef({
    currentX: 0,
    targetX: 0,
    maxScroll: 0,
    isDragging: false,
    startX: 0,
    startScrollX: 0,
    lastMouseX: 0,
    lastTime: performance.now(),
    dragVelocity: 0,
  });

  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorActive, setCursorActive] = useState(false);
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  // Update max scroll bound based on container & track size
  const updateBounds = useCallback(() => {
    if (!trackRef.current || !containerRef.current) return;
    const trackWidth = trackRef.current.scrollWidth;
    const containerWidth = containerRef.current.clientWidth;
    // Generous padding on both ends so final cards are beautifully centered
    physics.current.maxScroll = Math.max(0, trackWidth - containerWidth + 360);
  }, []);

  useEffect(() => {
    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, [updateBounds]);

  // Animation frame physics loop (lerp + inertia momentum)
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const p = physics.current;

      // Elastic bounds clamp with gentle resistance
      if (p.targetX < -p.maxScroll) {
        if (!p.isDragging) p.targetX += (-p.maxScroll - p.targetX) * 0.1;
      } else if (p.targetX > 0) {
        if (!p.isDragging) p.targetX += (0 - p.targetX) * 0.1;
      }

      // Smooth lerp (Aristide Benoist lerp factor: 0.075)
      const diff = p.targetX - p.currentX;
      p.currentX += diff * 0.075;

      // Send velocity to WebGL shader
      const vel = diff * 0.04;
      setVelocity(vel);

      // Apply transform to HTML track
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${p.currentX}px, 0, 0)`;
      }

      // Compute active index based on card positions
      if (trackRef.current && onActiveIndexChange) {
        const cards = trackRef.current.children;
        const screenCenter = window.innerWidth / 2;
        let closestIdx = 0;
        let minDistance = Infinity;

        for (let i = 0; i < cards.length; i++) {
          const rect = cards[i].getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const dist = Math.abs(cardCenter - screenCenter);
          if (dist < minDistance) {
            minDistance = dist;
            closestIdx = i;
          }
        }

        if (closestIdx !== activeIndex && closestIdx >= 0 && closestIdx < itemCount) {
          onActiveIndexChange(closestIdx);
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [activeIndex, itemCount, onActiveIndexChange, setVelocity]);

  // Wheel event handler (converts vertical & horizontal wheel to X axis)
  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    physics.current.targetX -= delta * 1.35;
    // Soft clamp
    physics.current.targetX = Math.max(
      -physics.current.maxScroll - 160,
      Math.min(160, physics.current.targetX)
    );
  };

  // Mouse drag events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary button
    physics.current.isDragging = true;
    physics.current.startX = e.clientX;
    physics.current.startScrollX = physics.current.targetX;
    physics.current.lastMouseX = e.clientX;
    physics.current.lastTime = performance.now();
    physics.current.dragVelocity = 0;
    setCursorActive(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
    setMouse(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );

    if (!physics.current.isDragging) return;

    const now = performance.now();
    const dt = Math.max(1, now - physics.current.lastTime);
    const dx = e.clientX - physics.current.lastMouseX;

    // Instantaneous drag velocity
    physics.current.dragVelocity = (dx / dt) * 16.6;
    physics.current.lastMouseX = e.clientX;
    physics.current.lastTime = now;

    const totalDelta = e.clientX - physics.current.startX;
    physics.current.targetX = physics.current.startScrollX + totalDelta * 1.15;
  };

  const handleMouseUp = () => {
    if (!physics.current.isDragging) return;
    physics.current.isDragging = false;
    setCursorActive(false);

    // Apply inertia momentum on release
    const momentum = physics.current.dragVelocity * 14;
    physics.current.targetX += momentum;
  };

  // Touch drag events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    physics.current.isDragging = true;
    physics.current.startX = touch.clientX;
    physics.current.startScrollX = physics.current.targetX;
    physics.current.lastMouseX = touch.clientX;
    physics.current.lastTime = performance.now();
    physics.current.dragVelocity = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!physics.current.isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const now = performance.now();
    const dt = Math.max(1, now - physics.current.lastTime);
    const dx = touch.clientX - physics.current.lastMouseX;

    physics.current.dragVelocity = (dx / dt) * 16.6;
    physics.current.lastMouseX = touch.clientX;
    physics.current.lastTime = now;

    const totalDelta = touch.clientX - physics.current.startX;
    physics.current.targetX = physics.current.startScrollX + totalDelta * 1.25;
  };

  const handleTouchEnd = () => {
    if (!physics.current.isDragging) return;
    physics.current.isDragging = false;
    const momentum = physics.current.dragVelocity * 12;
    physics.current.targetX += momentum;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 480;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        physics.current.targetX -= step;
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        physics.current.targetX += step;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
    >
      {/* ─── Horizontal Moving Track with Generous Gap & Padding ─── */}
      <div
        ref={trackRef}
        className="flex items-center h-full pl-[12vw] pr-[28vw] gap-24 sm:gap-32 md:gap-40 lg:gap-48 will-change-transform pt-12 pb-16"
      >
        {children}
      </div>

      {/* ─── Aristide Minimalist Fluid Cursor ─── */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-50 transition-opacity duration-300 hidden md:block"
        style={{
          transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0) translate(-50%, -50%)`,
        }}
      >
        <div
          className={`flex items-center justify-center rounded-full border border-[#bac4b8]/50 backdrop-blur-md transition-all duration-300 shadow-2xl ${
            cursorActive
              ? "w-24 h-24 bg-[#141414]/90 scale-110 border-[#cc9933]"
              : isHoveringCard
              ? "w-28 h-28 bg-[#141414]/85 scale-100 border-[#cc9933]/80"
              : "w-14 h-14 bg-[#141414]/60 scale-95"
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#bac4b8] font-semibold">
            {cursorActive ? "DRAGGING" : isHoveringCard ? "EXPAND" : "GLIDE"}
          </span>
        </div>
      </div>
    </div>
  );
}
