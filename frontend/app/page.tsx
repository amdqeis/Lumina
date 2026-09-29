import Link from "next/link";
import { getGoogleOAuthURL } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lumina — Photography Gallery",
  description: "A public photography gallery powered by Google Drive. Showcase your work without re-uploading.",
};

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(186,196,184,0.04) 0%, transparent 70%)",
          }}
        />

        {/* Index label */}
        <span className="index-label stagger-child mb-6">[ 001 ] Photography Gallery</span>

        {/* Hero title */}
        <h1 className="stagger-child font-editorial text-6xl md:text-8xl lg:text-[10rem] text-fg-bright leading-[0.9] tracking-tight mb-6">
          Lumina
        </h1>

        {/* Subtitle */}
        <p className="stagger-child max-w-md text-fg-dim text-base md:text-lg leading-relaxed mb-12">
          A cloud-native gallery where photographers share their work
          directly from Google Drive — no re-uploading, no compression.
        </p>

        {/* CTAs */}
        <div className="stagger-child flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/explore"
            className="px-8 py-3 bg-fg-bright text-bg text-sm font-medium tracking-wide hover:bg-fg transition-colors duration-300"
          >
            Explore Gallery
          </Link>
          <a
            href={getGoogleOAuthURL()}
            className="px-8 py-3 border border-white/15 text-fg hover:border-white/30 hover:text-fg-bright text-sm tracking-wide transition-all duration-300"
          >
            Sign in with Google
          </a>
        </div>
      </section>

      {/* ── Feature strip ── */}
      <section className="divider px-6 md:px-10 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              index: "01",
              title: "Cloud Sync",
              body: "Connect your Google Drive folder. We read your photos — never upload, never store your originals.",
            },
            {
              index: "02",
              title: "Diverse Feed",
              body: "Our Diverse Weighted Shuffle ensures every refresh shows different photographers, not just the most prolific.",
            },
            {
              index: "03",
              title: "EXIF Metadata",
              body: "Every photo surfaces camera model, aperture, ISO, and shutter speed extracted from Google Drive metadata.",
            },
          ].map((f) => (
            <div key={f.index} className="stagger-child flex flex-col gap-3">
              <span className="index-label">[ {f.index} ]</span>
              <h3 className="text-fg-bright text-base font-light">{f.title}</h3>
              <p className="text-fg-dim text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="divider px-6 md:px-10 py-6 flex items-center justify-between">
        <span className="index-label">Lumina © 2026</span>
        <span className="index-label">Cloud Computing Project</span>
      </footer>
    </div>
  );
}
