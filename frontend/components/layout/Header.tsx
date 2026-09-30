"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogIn, LogOut, Camera, Settings } from "lucide-react";

export default function Header() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/explore", label: "Explore" },
    ...(user ? [
      { href: "/dashboard", label: "Dashboard" },
    ] : []),
  ];

  if (pathname === "/") return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10">
      {/* Backdrop blur panel */}
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-md border-b border-white/[0.05]" />

      {/* Logo */}
      <Link href="/" className="relative z-10 flex items-center gap-2 group">
        <Camera size={16} className="text-fg-dim group-hover:text-fg-bright transition-colors duration-300" />
        <span className="font-editorial text-lg text-fg-bright tracking-wide">Lumina</span>
      </Link>

      {/* Nav Links */}
      <nav className="relative z-10 hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`index-label transition-colors duration-300 hover:text-fg-bright ${
              pathname === link.href ? "text-fg-bright" : "text-fg-dim"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Auth Controls */}
      <div className="relative z-10 flex items-center gap-3">
        {isLoading ? (
          <div className="w-6 h-6 rounded-full bg-bg-secondary animate-pulse" />
        ) : user ? (
          <>
            {/* User avatar */}
            <Link href="/profile" className="group" title="Your Profile">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.display_name || ""}
                  className="w-7 h-7 rounded-full object-cover border border-white/10 group-hover:border-white/30 transition-all duration-300"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-bg-secondary border border-white/10 flex items-center justify-center">
                  <span className="text-xs text-fg-dim">
                    {(user.display_name || "U")[0]}
                  </span>
                </div>
              )}
            </Link>
            <Link href="/settings" title="Settings">
              <Settings size={15} className="text-fg-dim hover:text-fg-bright transition-colors duration-300" />
            </Link>
            <button
              onClick={logout}
              title="Sign out"
              className="text-fg-dim hover:text-fg-bright transition-colors duration-300"
            >
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:border-white/25 text-fg-dim hover:text-fg-bright transition-all duration-300 rounded-sm"
          >
            <LogIn size={13} />
            <span className="index-label">Sign in</span>
          </Link>
        )}
      </div>
    </header>
  );
}
