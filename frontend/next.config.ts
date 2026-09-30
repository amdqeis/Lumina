import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile avatars
      },
      {
        protocol: "https",
        hostname: "drive.google.com", // Google Drive thumbnails
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com", // Drive thumbnail CDN
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
