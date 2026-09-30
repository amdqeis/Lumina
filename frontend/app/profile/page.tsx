"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, type User } from "@/lib/api";
import {
  Loader2,
  Save,
  LogOut,
  User as UserIcon,
  Mail,
  Phone,
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  Settings,
  Shield,
  Camera,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function ProfileField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  readonly = false,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  readonly?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#6E756C]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E756C] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          readOnly={readonly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#1a1a1a] border border-[#bac4b8]/15 outline-none py-3 text-sm text-white placeholder:text-[#6E756C]/50 transition-colors duration-200 ${
            icon ? "pl-10 pr-4" : "px-4"
          } ${
            readonly
              ? "opacity-50 cursor-not-allowed"
              : "focus:border-[#cc9933]/50 hover:border-[#bac4b8]/30"
          }`}
        />
      </div>
      {hint && (
        <span className="text-[10px] font-mono text-[#6E756C]/70 leading-relaxed">
          {hint}
        </span>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoading: authLoading, refresh, logout } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ display_name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setForm({
        display_name: user.display_name || "",
        phone: (user as User & { phone?: string }).phone || "",
      });
    }
  }, [user]);

  const set = (field: string) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await updateProfile(
        Object.fromEntries(Object.entries(form).filter(([, v]) => v !== "")) as Partial<User>
      );
      await refresh();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Failed to save. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0e0e0e]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={20} className="text-[#cc9933] animate-spin" />
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#6E756C]">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const emailVerified = (user as User & { email_verified?: boolean }).email_verified;
  const isEmailAuth = !user.google_id && !!user.email;
  const authMethod = user.google_id ? "Google OAuth" : user.email ? "Email / Password" : "Unknown";
  const initials = (user.display_name || user.email || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-dvh bg-[#0e0e0e] text-[#bac4b8]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-[#cc9933]/4 blur-[140px]" />
      </div>

      <header className="sticky top-0 z-40 bg-[#0e0e0e]/95 backdrop-blur-md border-b border-[#bac4b8]/8 px-6 md:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-[#6E756C] hover:text-[#bac4b8] transition-colors">
          <ChevronLeft size={12} />
          Lumina
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/settings" className="flex items-center gap-1.5 text-[10px] font-mono tracking-[0.15em] uppercase text-[#6E756C] hover:text-[#bac4b8] transition-colors">
            <Settings size={11} />
            Settings
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-[10px] font-mono tracking-[0.15em] uppercase text-[#6E756C] hover:text-red-400 transition-colors cursor-pointer">
            <LogOut size={11} />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-12 relative">
        {/* Avatar hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center mb-12"
        >
          <div className="relative mb-5">
            {user.avatar_url ? (
              <>
                <img src={user.avatar_url} alt={user.display_name || ""} className="w-24 h-24 rounded-full border-2 border-[#bac4b8]/20 object-cover" />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#141414] border border-[#bac4b8]/20 flex items-center justify-center">
                  <Camera size={11} className="text-[#cc9933]" />
                </div>
              </>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1c1c1c] to-[#252525] border-2 border-[#bac4b8]/15 flex items-center justify-center">
                <span className="font-serif italic text-3xl text-[#cc9933]/80">{initials}</span>
              </div>
            )}
          </div>
          <h1 className="font-serif italic text-3xl text-white leading-tight">
            {user.display_name || "Your Profile"}
          </h1>
          {user.username && <p className="text-sm font-mono text-[#6E756C] mt-1">@{user.username}</p>}
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            <span className="text-[9px] font-mono tracking-widest uppercase text-[#cc9933]/80 px-2.5 py-1 bg-[#cc9933]/8 border border-[#cc9933]/20">
              {authMethod}
            </span>
            {emailVerified && (
              <span className="text-[9px] font-mono tracking-widest uppercase text-green-400/80 px-2.5 py-1 bg-green-400/8 border border-green-400/20 flex items-center gap-1.5">
                <CheckCircle size={8} />
                Verified
              </span>
            )}
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#6E756C]">Contact Information</span>
            <div className="flex-1 h-px bg-[#bac4b8]/10" />
          </div>
          <div className="bg-[#141414] border border-[#bac4b8]/10 divide-y divide-[#bac4b8]/8">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Mail size={13} className="text-[#6E756C] flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#6E756C]">Email</p>
                  <p className="text-xs font-mono text-white mt-0.5">{user.email || "—"}</p>
                </div>
              </div>
              {emailVerified ? (
                <span className="flex items-center gap-1.5 text-[9px] font-mono text-green-400 bg-green-400/8 border border-green-400/20 px-2.5 py-1 tracking-widest uppercase">
                  <CheckCircle size={9} />
                  Verified
                </span>
              ) : user.email ? (
                <Link href="/login" className="text-[9px] font-mono tracking-wider uppercase text-[#cc9933] hover:text-[#d4a635] border border-[#cc9933]/30 hover:border-[#cc9933]/60 px-2.5 py-1 transition-colors duration-200">
                  Verify
                </Link>
              ) : null}
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-3 mb-3">
                <Phone size={13} className="text-[#6E756C] flex-shrink-0" />
                <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#6E756C]">Phone Number</p>
              </div>
              <ProfileField
                label=""
                name="phone"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+62 812 3456 7890"
                type="tel"
                hint="For account recovery only. Never shown publicly."
              />
            </div>
          </div>
        </motion.div>

        {/* Display Name */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.14 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#6E756C]">Identity</span>
            <div className="flex-1 h-px bg-[#bac4b8]/10" />
          </div>
          <div className="bg-[#141414] border border-[#bac4b8]/10 p-5 flex flex-col gap-4">
            <ProfileField
              label="Display Name"
              name="display_name"
              value={form.display_name}
              onChange={set("display_name")}
              placeholder="Your full name"
              icon={<UserIcon size={13} />}
            />
            <ProfileField
              label="Account Email"
              name="email_ro"
              value={user.email || "—"}
              readonly
              icon={<Mail size={13} />}
              hint="Email cannot be changed here."
            />
          </div>
        </motion.div>

        {/* Save */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6"
        >
          <AnimatePresence>
            {success && (
              <motion.div key="success" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 mb-4 bg-green-500/8 border border-green-500/25 text-green-400 text-xs font-mono">
                <CheckCircle size={12} />
                Profile saved successfully
              </motion.div>
            )}
            {error && (
              <motion.div key="error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-3 mb-4 bg-red-500/8 border border-red-500/25 text-red-400 text-xs font-mono">
                <AlertTriangle size={12} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#cc9933] text-black text-sm font-semibold hover:bg-[#d4a635] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </motion.div>

        {/* Security & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.26 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#6E756C]">Security & Account</span>
            <div className="flex-1 h-px bg-[#bac4b8]/10" />
          </div>
          <div className="bg-[#141414] border border-[#bac4b8]/10 divide-y divide-[#bac4b8]/8">
            <div className="flex items-start gap-3 px-5 py-4">
              <Shield size={13} className="text-[#cc9933] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-white font-medium">{authMethod}</p>
                <p className="text-[10px] font-mono text-[#6E756C] mt-0.5 leading-relaxed">
                  {user.google_id ? "Linked to Google — security managed by Google." : "Email & password authentication."}
                </p>
              </div>
            </div>
            {isEmailAuth && (
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-start gap-3">
                  <KeyRound size={13} className="text-[#6E756C] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white font-medium">Change Password</p>
                    <p className="text-[10px] font-mono text-[#6E756C] mt-0.5">Reset via email OTP</p>
                  </div>
                </div>
                <Link href="/login?screen=forgot" className="flex-shrink-0 px-3.5 py-2 border border-[#bac4b8]/15 hover:border-[#cc9933]/40 text-[9px] font-mono tracking-wider text-[#bac4b8] hover:text-[#cc9933] transition-colors duration-200 uppercase whitespace-nowrap">
                  Reset →
                </Link>
              </div>
            )}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-start gap-3">
                <Settings size={13} className="text-[#6E756C] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white font-medium">Advanced Settings</p>
                  <p className="text-[10px] font-mono text-[#6E756C] mt-0.5">Bio, social links, portfolio & more</p>
                </div>
              </div>
              <Link href="/settings" className="flex-shrink-0 px-3.5 py-2 border border-[#bac4b8]/15 hover:border-[#bac4b8]/40 text-[9px] font-mono tracking-wider text-[#bac4b8] hover:text-white transition-colors duration-200 uppercase whitespace-nowrap">
                Open →
              </Link>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-start gap-3">
                <LogOut size={13} className="text-red-500/50 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white font-medium">Sign Out</p>
                  <p className="text-[10px] font-mono text-[#6E756C] mt-0.5">End your current session</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2 border border-[#bac4b8]/15 hover:border-red-500/40 hover:text-red-400 text-[9px] font-mono tracking-wider text-[#bac4b8] transition-all duration-200 uppercase cursor-pointer"
              >
                <LogOut size={10} />
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-[#141414] border border-[#bac4b8]/10 divide-y divide-[#bac4b8]/8"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#6E756C]">Account ID</span>
            <span className="text-xs font-mono text-[#bac4b8] opacity-40">{user.id.slice(0, 8) + "…"}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#6E756C]">Member Since</span>
            <span className="text-xs font-mono text-[#bac4b8]">
              {new Date(user.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
