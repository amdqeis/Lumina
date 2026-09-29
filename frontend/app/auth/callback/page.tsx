"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeGoogleCode } from "@/lib/api";
import { getRedirectURI, saveAuth } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

function CallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const called = useRef(false);

  useEffect(() => {
    // Guard: prevent double-call from React StrictMode or re-renders
    if (called.current) return;
    called.current = true;

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error || !code) {
      router.replace("/?error=auth_failed");
      return;
    }

    const redirectUri = getRedirectURI();
    exchangeGoogleCode(code, redirectUri)
      .then((data: { access_token: string; user: Parameters<typeof login>[1] }) => {
        login(data.access_token, data.user);
        router.replace("/dashboard");
      })
      .catch(() => {
        router.replace("/?error=auth_failed");
      });
  }, [searchParams, router, login]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
      <div className="w-6 h-6 border border-fg-dim border-t-fg-bright rounded-full animate-spin" />
      <p className="index-label">Authenticating with Google…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-6 h-6 border border-fg-dim border-t-fg-bright rounded-full animate-spin" />
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
