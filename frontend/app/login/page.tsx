"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  loginEmail,
  registerEmail,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
  getMe,
} from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { getGoogleOAuthURL } from "@/lib/auth";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  ChevronLeft,
  CheckCircle,
} from "lucide-react";

// ─── Tiny reusable input ────────────────────────────────────────────────────
function AuthInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  suffix,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#6E756C]">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E756C] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#1a1a1a] border border-[#bac4b8]/15 focus:border-[#cc9933]/50 outline-none py-3 text-sm text-white placeholder:text-[#6E756C]/60 transition-colors duration-200 ${icon ? "pl-10 pr-4" : "px-4"} ${suffix ? "pr-12" : ""}`}
          autoComplete="off"
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6E756C]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── OTP Input ──────────────────────────────────────────────────────────────
function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#6E756C]">
        Verification Code
      </label>
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        className="w-full bg-[#1a1a1a] border border-[#cc9933]/30 focus:border-[#cc9933]/70 outline-none py-4 text-center text-3xl font-mono tracking-[0.4em] text-[#cc9933] placeholder:text-[#cc9933]/20 transition-colors duration-200"
      />
    </div>
  );
}

type Screen =
  | "select"
  | "login"
  | "register"
  | "verify"
  | "forgot"
  | "reset"
  | "success";

function LoginPageInner() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [screen, setScreen] = useState<Screen>("select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Handle ?screen= query param (e.g. from settings "Reset Password" link)
  useEffect(() => {
    const s = searchParams.get("screen");
    if (s === "forgot") setScreen("forgot");
    else if (s === "register") setScreen("register");
    else if (s === "login") setScreen("login");
  }, [searchParams]);

  const clearMessages = () => { setError(null); setInfo(null); };

  const handleLoginEmail = async () => {
    clearMessages();
    setLoading(true);
    try {
      const data = await loginEmail(email, password);
      const me = await getMe();
      saveAuth(data.access_token, me);
      login(data.access_token, me);
      router.push("/");
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (detail?.includes("verify your email")) {
        setInfo("Please verify your email first. Check your inbox for the OTP code.");
        setScreen("verify");
      } else {
        setError(detail || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    clearMessages();
    if (!email || !password) return setError("Please fill in all fields.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    try {
      await registerEmail(email, password, displayName || undefined);
      setInfo("Account created! We sent a 6-digit code to your email.");
      setScreen("verify");
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    clearMessages();
    setLoading(true);
    try {
      const data = await verifyEmail(email, otpCode);
      const me = await getMe();
      saveAuth(data.access_token, me);
      login(data.access_token, me);
      router.push("/");
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail || "Invalid or expired code. Try resending.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    clearMessages();
    try {
      await resendOtp(email);
      setInfo("New code sent. Check your inbox.");
    } catch {
      setError("Could not resend code. Please wait a moment.");
    }
  };

  const handleForgot = async () => {
    clearMessages();
    setLoading(true);
    try {
      await forgotPassword(email);
      setInfo("If this email is registered, you will receive a reset code.");
      setScreen("reset");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    clearMessages();
    if (newPassword.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    try {
      const data = await resetPassword(email, otpCode, newPassword);
      const me = await getMe();
      saveAuth(data.access_token, me);
      login(data.access_token, me);
      router.push("/");
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Screen: Select method ─────────────────────────────────────────────────
  const SelectScreen = () => (
    <motion.div
      key="select"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4"
    >
      <a
        href={getGoogleOAuthURL()}
        className="flex items-center justify-center gap-3 py-3.5 bg-white text-black text-sm font-medium tracking-wide hover:bg-white/90 transition-colors duration-200"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </a>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#bac4b8]/15" />
        <span className="text-[10px] font-mono tracking-[0.2em] text-[#6E756C] uppercase">or</span>
        <div className="flex-1 h-px bg-[#bac4b8]/15" />
      </div>

      <button
        onClick={() => { clearMessages(); setScreen("login"); }}
        className="py-3.5 bg-[#1a1a1a] border border-[#bac4b8]/15 text-sm text-[#bac4b8] hover:border-[#bac4b8]/40 hover:text-white transition-colors duration-200 font-medium tracking-wide"
      >
        Sign in with Email
      </button>
      <button
        onClick={() => { clearMessages(); setScreen("register"); }}
        className="py-3.5 border border-[#cc9933]/40 text-sm text-[#cc9933] hover:bg-[#cc9933]/10 transition-colors duration-200 font-medium tracking-wide"
      >
        Create Account
      </button>
    </motion.div>
  );

  // ─── Screen: Login ──────────────────────────────────────────────────────────
  const LoginScreen = () => (
    <motion.form
      key="login"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={(e) => { e.preventDefault(); handleLoginEmail(); }}
      className="flex flex-col gap-4"
    >
      <AuthInput id="login-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon={<Mail size={14} />} />
      <AuthInput
        id="login-password"
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        icon={<Lock size={14} />}
        suffix={
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#6E756C] hover:text-white transition-colors cursor-pointer">
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        }
      />
      <button
        type="button"
        onClick={() => { clearMessages(); setScreen("forgot"); }}
        className="text-[10px] font-mono tracking-widest text-[#cc9933]/70 hover:text-[#cc9933] text-right transition-colors"
      >
        FORGOT PASSWORD?
      </button>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 py-3.5 bg-[#cc9933] text-black text-sm font-semibold hover:bg-[#d4a635] transition-colors duration-200 disabled:opacity-60 mt-1"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
        Sign In
      </button>
      <button type="button" onClick={() => { clearMessages(); setScreen("select"); }} className="text-[10px] font-mono tracking-widest text-[#6E756C] hover:text-[#bac4b8] transition-colors mt-1">
        ← OTHER OPTIONS
      </button>
    </motion.form>
  );

  // ─── Screen: Register ────────────────────────────────────────────────────────
  const RegisterScreen = () => (
    <motion.form
      key="register"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={(e) => { e.preventDefault(); handleRegister(); }}
      className="flex flex-col gap-4"
    >
      <AuthInput id="reg-name" label="Display Name (optional)" value={displayName} onChange={setDisplayName} placeholder="Your name" icon={<User size={14} />} />
      <AuthInput id="reg-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon={<Mail size={14} />} />
      <AuthInput
        id="reg-password"
        label="Password (min. 8 characters)"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        icon={<Lock size={14} />}
        suffix={
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#6E756C] hover:text-white transition-colors cursor-pointer">
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        }
      />
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 py-3.5 bg-[#cc9933] text-black text-sm font-semibold hover:bg-[#d4a635] transition-colors duration-200 disabled:opacity-60 mt-1"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
        Create Account
      </button>
      <button type="button" onClick={() => { clearMessages(); setScreen("select"); }} className="text-[10px] font-mono tracking-widest text-[#6E756C] hover:text-[#bac4b8] transition-colors mt-1">
        ← OTHER OPTIONS
      </button>
    </motion.form>
  );

  // ─── Screen: Verify Email ────────────────────────────────────────────────────
  const VerifyScreen = () => (
    <motion.div
      key="verify"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5"
    >
      <p className="text-sm text-[#bac4b8]/80 leading-relaxed">
        We sent a 6-digit code to <span className="text-white font-mono">{email}</span>.
        Enter it below to verify your account.
      </p>
      <OTPInput value={otpCode} onChange={setOtpCode} />
      <button
        onClick={handleVerify}
        disabled={loading || otpCode.length < 6}
        className="flex items-center justify-center gap-2 py-3.5 bg-[#cc9933] text-black text-sm font-semibold hover:bg-[#d4a635] transition-colors duration-200 disabled:opacity-60"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
        Verify Email
      </button>
      <button onClick={handleResend} className="text-[10px] font-mono tracking-widest text-[#cc9933]/70 hover:text-[#cc9933] transition-colors">
        RESEND CODE
      </button>
    </motion.div>
  );

  // ─── Screen: Forgot password ────────────────────────────────────────────────
  const ForgotScreen = () => (
    <motion.div
      key="forgot"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4"
    >
      <p className="text-sm text-[#bac4b8]/80 leading-relaxed">
        Enter your email address and we&apos;ll send you a code to reset your password.
      </p>
      <AuthInput id="forgot-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon={<Mail size={14} />} />
      <button
        onClick={handleForgot}
        disabled={loading || !email}
        className="flex items-center justify-center gap-2 py-3.5 bg-[#cc9933] text-black text-sm font-semibold hover:bg-[#d4a635] transition-colors duration-200 disabled:opacity-60"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
        Send Reset Code
      </button>
      <button type="button" onClick={() => { clearMessages(); setScreen("login"); }} className="text-[10px] font-mono tracking-widest text-[#6E756C] hover:text-[#bac4b8] transition-colors">
        ← BACK TO SIGN IN
      </button>
    </motion.div>
  );

  // ─── Screen: Reset password ──────────────────────────────────────────────────
  const ResetScreen = () => (
    <motion.div
      key="reset"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4"
    >
      <p className="text-sm text-[#bac4b8]/80 leading-relaxed">
        Enter the code we sent to <span className="text-white font-mono">{email}</span> and your new password.
      </p>
      <OTPInput value={otpCode} onChange={setOtpCode} />
      <AuthInput
        id="reset-password"
        label="New Password (min. 8 characters)"
        type={showPassword ? "text" : "password"}
        value={newPassword}
        onChange={setNewPassword}
        placeholder="••••••••"
        icon={<Lock size={14} />}
        suffix={
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#6E756C] hover:text-white transition-colors cursor-pointer">
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        }
      />
      <button
        onClick={handleReset}
        disabled={loading || otpCode.length < 6 || newPassword.length < 8}
        className="flex items-center justify-center gap-2 py-3.5 bg-[#cc9933] text-black text-sm font-semibold hover:bg-[#d4a635] transition-colors duration-200 disabled:opacity-60"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
        Reset Password
      </button>
    </motion.div>
  );

  const screenTitles: Record<Screen, string> = {
    select: "Welcome",
    login: "Sign In",
    register: "Create Account",
    verify: "Verify Email",
    forgot: "Forgot Password",
    reset: "Reset Password",
    success: "Done",
  };

  const screenSubtitles: Record<Screen, string> = {
    select: "Sign in to access your Lumina archive.",
    login: "Enter your credentials to continue.",
    register: "Create a free Lumina account.",
    verify: "Check your inbox.",
    forgot: "We'll send a reset code.",
    reset: "Set your new password.",
    success: "You're all set.",
  };

  return (
    <div className="min-h-dvh w-full bg-[#0e0e0e] flex items-center justify-center p-4 relative">
      {/* Subtle ambient gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#cc9933]/4 blur-[120px]" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Back to home */}
        <Link href="/" className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-[#6E756C] hover:text-[#bac4b8] transition-colors mb-8 w-fit">
          <ChevronLeft size={12} />
          LUMINA
        </Link>

        {/* Card */}
        <div className="bg-[#141414] border border-[#bac4b8]/12 p-8">
          {/* Header */}
          <div className="mb-8">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#6E756C]">
              [ {screenTitles[screen].toUpperCase()} ]
            </span>
            <h1 className="font-serif italic text-3xl text-white mt-2 mb-1">
              {screenTitles[screen]}
            </h1>
            <p className="text-sm text-[#6E756C]">{screenSubtitles[screen]}</p>
          </div>

          {/* Feedback messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono leading-relaxed overflow-hidden"
              >
                {error}
              </motion.div>
            )}
            {info && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 px-4 py-3 bg-[#cc9933]/10 border border-[#cc9933]/30 text-[#cc9933] text-xs font-mono leading-relaxed overflow-hidden"
              >
                {info}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Screen content */}
          <AnimatePresence mode="wait">
            {screen === "select" && <SelectScreen />}
            {screen === "login" && <LoginScreen />}
            {screen === "register" && <RegisterScreen />}
            {screen === "verify" && <VerifyScreen />}
            {screen === "forgot" && <ForgotScreen />}
            {screen === "reset" && <ResetScreen />}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          {screen === "login" && (
            <button
              onClick={() => { clearMessages(); setScreen("register"); }}
              className="text-[10px] font-mono tracking-widest text-[#6E756C] hover:text-[#bac4b8] transition-colors uppercase"
            >
              Don&apos;t have an account? <span className="text-[#cc9933]">Create one</span>
            </button>
          )}
          {screen === "register" && (
            <button
              onClick={() => { clearMessages(); setScreen("login"); }}
              className="text-[10px] font-mono tracking-widest text-[#6E756C] hover:text-[#bac4b8] transition-colors uppercase"
            >
              Already have an account? <span className="text-[#cc9933]">Sign in</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh w-full bg-[#0e0e0e] flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-[#cc9933]/30 border-t-[#cc9933] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
