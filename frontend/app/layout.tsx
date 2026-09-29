import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import SmoothScroll from "@/components/layout/SmoothScroll";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lumina — Photography Gallery",
  description:
    "A public photography gallery powered by Google Drive. Discover curated works from photographers around the world.",
  keywords: ["photography", "gallery", "Google Drive", "portfolio", "photographers"],
  openGraph: {
    title: "Lumina — Photography Gallery",
    description: "Discover photography from around the world. Sync your Google Drive and showcase your work.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-bg">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <SmoothScroll>
            <Header />
            <main>{children}</main>
          </SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  );
}
