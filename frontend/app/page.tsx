import type { Metadata } from "next";
import AristideGallery from "@/components/aristide/AristideGallery";

export const metadata: Metadata = {
  title: "Lumina — Cloud Photography Archive",
  description:
    "An editorial photography gallery powered by Google Drive. Inspired by Aristide Benoist design aesthetics.",
};

export default function HomePage() {
  return <AristideGallery />;
}
