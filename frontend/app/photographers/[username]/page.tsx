import { getPublicProfile } from "@/lib/api";
import Link from "next/link";
import type { Metadata } from "next";
import { AtSign, Globe, Camera } from "lucide-react";
import ProfileGallery from "./ProfileGallery";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} — Lumina`,
    description: `Photography by ${username} on Lumina Gallery`,
  };
}

export default async function PhotographerProfilePage({ params }: Props) {
  const { username } = await params;

  let profile = null;
  try {
    profile = await getPublicProfile(username);
  } catch {
    // Not found
  }

  if (!profile) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <span className="index-label">[ 404 ]</span>
        <h1 className="font-editorial text-3xl text-fg-bright">Photographer not found</h1>
        <Link href="/explore" className="index-label text-fg-dim hover:text-fg-bright transition-colors">
          ← Back to Explore
        </Link>
      </div>
    );
  }

  const displayName = profile.display_name || profile.username || username;

  return (
    <div className="min-h-dvh pt-20 pb-20">
      {/* ── Profile Header ── */}
      <section className="px-4 md:px-10 pt-10 pb-10 max-w-5xl mx-auto">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-bg-secondary border border-white/10 flex items-center justify-center">
                <Camera size={24} className="text-fg-dim" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <span className="index-label">[ PHOTOGRAPHER ]</span>
            <h1 className="font-editorial text-3xl md:text-5xl text-fg-bright mt-1 leading-tight">
              {displayName}
            </h1>
            {profile.username && (
              <p className="index-label mt-1">@{profile.username}</p>
            )}
            {profile.bio && (
              <p className="text-fg-dim text-sm mt-3 leading-relaxed max-w-lg">
                {profile.bio}
              </p>
            )}

            {/* Social links */}
            <div className="flex items-center gap-4 mt-4">
              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-fg-dim hover:text-fg-bright transition-colors"
                >
                  <AtSign size={13} />
                  <span className="index-label">{profile.instagram}</span>
                </a>
              )}
              {profile.portfolio && (
                <a
                  href={profile.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-fg-dim hover:text-fg-bright transition-colors"
                >
                  <Globe size={13} />
                  <span className="index-label">Portfolio</span>
                </a>
              )}
            </div>
          </div>

          {/* Photo count */}
          <div className="flex-shrink-0 text-right hidden md:block">
            <span className="font-editorial text-4xl text-fg-bright">
              {String(profile.public_photo_count).padStart(3, "0")}
            </span>
            <p className="index-label mt-1">photos</p>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── Gallery ── */}
      <section className="px-4 md:px-10 pt-8 max-w-5xl mx-auto">
        <ProfileGallery photos={profile.photos} />
      </section>
    </div>
  );
}
