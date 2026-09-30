"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, type User } from "@/lib/api";
import {
  Loader2,
  Save,
  Link2,
  Globe,
  LogOut,
  User as UserIcon,
  Mail,
  Phone,
  Camera,
  ChevronLeft,
  CheckCircle,
  Shield,
  Settings,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ─── Field component ─────────────────────────────────────────────────────────
function Field({
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
      <label className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#6E756C]">
        {label}
      </label>
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

function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#6E756C]">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[#1a1a1a] border border-[#bac4b8]/15 hover:border-[#bac4b8]/30 focus:border-[#cc9933]/50 outline-none px-4 py-3 text-sm text-white placeholder:text-[#6E756C]/50 transition-colors duration-200 resize-none"
      />
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-5">
      <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#6E756C]">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#bac4b8]/10" />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-mono tracking-[0.15em] uppercase transition-all duration-200 border-b-2 cursor-pointer ${
        active
          ? "border-[#cc9933] text-[#cc9933]"
          : "border-transparent text-[#6E756C] hover:text-[#bac4b8] hover:border-[#bac4b8]/30"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

type Tab = "profile" | "security" | "account";

export default function ProfilePage() {
  const { user, isLoading: authLoading, refresh, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [form, setForm] = useState({
    display_name: "",
    username: "",
    bio: "",
    phone: "",
    instagram: "",
    portfolio: "",
  });
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
        username: user.username || "",
        bio: user.bio || "",
        phone: (user as User & { phone?: string }).phone || "",
        instagram: user.instagram || "",
        portfolio: user.portfolio || "",
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
        Object.fromEntries(
          Object.entries(form).filter(([, v]) => v !== "")
        ) as Partial<User>
      );
      await refresh();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to save. Please try again.";
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
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#6E756C]">
            Loading…
          </span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const authMethod = user.google_id
    ? "Google OAuth"
    : user.email
    ? "Email / Password"
    : "Unknown";
  const isEmailAuth = !user.google_id && !!user.email;
  const emailVerified = (user as User & { email_verified?: boolean }).email_verified;
  const initials = (user.display_name || user.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-dvh bg-[#0e0e0e] text-[#bac4b8]">
      {/* Ambient gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#cc9933]/3 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0e0e0e]/95 backdrop-blur-md border-b border-[#bac4b8]/8 px-6 md:px-12 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-[#6E756C] hover:text-[#bac4b8] transition-colors"
        >
          <ChevronLeft size={12} />
          Lumina
        </Link>
        <div className="flex items-center gap-2">
          <Settings size={12} className="text-[#6E756C]" />
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#6E756C]">
            Profile & Settings
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 relative">
        {/* Hero: Avatar + identity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-6 mb-10"
        >
          <div className="relative flex-shrink-0">
            {user.avatar_url ? (
              <>
                <img
                  src={user.avatar_url}
                  alt={user.display_name || ""}
                  className="w-20 h-20 rounded-full border-2 border-[#bac4b8]/15 object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#141414] border border-[#bac4b8]/20 flex items-center justify-center">
                  <Camera size={10} className="text-[#cc9933]" />
                </div>
              </>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#222] border-2 border-[#bac4b8]/15 flex items-center justify-center">
                <span className="font-serif italic text-2xl text-[#cc9933]/80">
                  {initials}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-serif italic text-2xl md:text-3xl text-white leading-tight truncate">
              {user.display_name || "Your Profile"}
            </h1>
            {user.username && (
              <p className="text-sm font-mono text-[#6E756C] mt-0.5">
                @{user.username}
              </p>
            )}
            {user.email && (
              <p className="text-xs text-[#6E756C] mt-0.5 font-mono truncate">
                {user.email}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[9px] font-mono tracking-widest uppercase text-[#cc9933]/80 px-2 py-0.5 bg-[#cc9933]/8 border border-[#cc9933]/20">
                {authMethod}
              </span>
              {emailVerified && (
                <span className="text-[9px] font-mono tracking-widest uppercase text-green-400/80 px-2 py-0.5 bg-green-400/8 border border-green-400/20 flex items-center gap-1">
                  <CheckCircle size={8} />
                  Verified
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center border-b border-[#bac4b8]/10 mb-8 -mx-1"
        >
          <TabButton
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            icon={<UserIcon size={11} />}
            label="Profile"
          />
          <TabButton
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
            icon={<Shield size={11} />}
            label="Security"
          />
          <TabButton
            active={activeTab === "account"}
            onClick={() => setActiveTab("account")}
            icon={<Settings size={11} />}
            label="Account"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <motion.form
              key="profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={(e) => { e.preventDefault(); handleSave(); }}
              className="flex flex-col gap-5"
            >
              <SectionLabel label="Personal Information" />
              <Field
                label="Display Name"
                name="display_name"
                value={form.display_name}
                onChange={set("display_name")}
                placeholder="Your full name"
                icon={<UserIcon size={13} />}
              />
              <Field
                label="Username"
                name="username"
                value={form.username}
                onChange={set("username")}
                placeholder="your-handle"
                hint="Lowercase letters, numbers, and hyphens only."
              />
              <TextareaField
                label="Bio"
                name="bio"
                value={form.bio}
                onChange={set("bio")}
                placeholder="A short description about yourself and your photography..."
              />

              <SectionLabel label="Contact" />
              <Field
                label="Email"
                name="email"
                value={(user as User & { email?: string }).email || "—"}
                readonly
                icon={<Mail size={13} />}
                hint="Email is tied to your authentication method and cannot be changed here."
              />
              <Field
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+62 812 3456 7890"
                type="tel"
                icon={<Phone size={13} />}
              />

              <SectionLabel label="Social & Portfolio" />
              <Field
                label="Instagram"
                name="instagram"
                value={form.instagram}
                onChange={set("instagram")}
                placeholder="@yourhandle"
                icon={<Link2 size={13} />}
              />
              <Field
                label="Portfolio / Website"
                name="portfolio"
                value={form.portfolio}
                onChange={set("portfolio")}
                placeholder="https://yoursite.com"
                icon={<Globe size={13} />}
              />

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-4 py-3 bg-green-500/8 border border-green-500/25 text-green-400 text-xs font-mono"
                  >
                    <CheckCircle size={12} />
                    Profile saved successfully
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-4 py-3 bg-red-500/8 border border-red-500/25 text-red-400 text-xs font-mono"
                  >
                    <AlertTriangle size={12} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 py-3.5 bg-[#cc9933] text-black text-sm font-semibold hover:bg-[#d4a635] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 mt-2 cursor-pointer"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Saving…" : "Save Profile"}
              </button>
            </motion.form>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4"
            >
              <SectionLabel label="Authentication" />
              <div className="bg-[#141414] border border-[#bac4b8]/10 p-5">
                <div className="flex items-start gap-3">
                  <Shield size={16} className="text-[#cc9933] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">{authMethod}</p>
                    <p className="text-xs text-[#6E756C] mt-1 font-mono leading-relaxed">
                      {user.google_id
                        ? "Your account is linked to Google. Sign-in is managed by Google OAuth."
                        : "Your account uses email and password for authentication."}
                    </p>
                    {emailVerified && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <CheckCircle size={11} className="text-green-400" />
                        <span className="text-[10px] font-mono text-green-400">Email verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isEmailAuth ? (
                <>
                  <SectionLabel label="Password" />
                  <div className="bg-[#141414] border border-[#bac4b8]/10 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-white font-medium">Change Password</p>
                        <p className="text-xs text-[#6E756C] mt-1 font-mono">
                          Request a reset code via email to set a new password.
                        </p>
                      </div>
                      <Link
                        href="/login?screen=forgot"
                        className="flex-shrink-0 px-4 py-2.5 border border-[#bac4b8]/15 hover:border-[#cc9933]/40 text-[10px] font-mono tracking-wider text-[#bac4b8] hover:text-[#cc9933] transition-colors duration-200 uppercase whitespace-nowrap"
                      >
                        Reset Password
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-[#141414] border border-[#bac4b8]/10 p-5">
                  <p className="text-xs text-[#6E756C] font-mono leading-relaxed">
                    Password management is not available for Google-linked accounts. 
                    Manage your security settings through your Google Account.
                  </p>
                </div>
              )}

              <SectionLabel label="Email" />
              <div className="bg-[#141414] border border-[#bac4b8]/10 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium flex items-center gap-2">
                      <Mail size={13} className="text-[#6E756C] flex-shrink-0" />
                      <span className="truncate">
                        {(user as User & { email?: string }).email || "No email linked"}
                      </span>
                    </p>
                    <p className="text-xs text-[#6E756C] mt-1 font-mono ml-5">
                      {emailVerified ? "Email address verified" : "Email not yet verified"}
                    </p>
                  </div>
                  {emailVerified ? (
                    <span className="flex-shrink-0 flex items-center gap-1.5 text-[10px] font-mono text-green-400 bg-green-400/8 border border-green-400/20 px-2.5 py-1.5">
                      <CheckCircle size={10} />
                      Verified
                    </span>
                  ) : (
                    <Link
                      href="/login"
                      className="flex-shrink-0 text-[10px] font-mono tracking-wider text-[#cc9933] hover:text-[#d4a635] border border-[#cc9933]/30 hover:border-[#cc9933]/60 px-3 py-1.5 transition-colors duration-200 uppercase"
                    >
                      Verify
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4"
            >
              <SectionLabel label="Account Info" />
              <div className="bg-[#141414] border border-[#bac4b8]/10 divide-y divide-[#bac4b8]/8">
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#6E756C]">Account ID</span>
                  <span className="text-xs font-mono text-[#bac4b8] opacity-40 truncate max-w-[160px]">{user.id}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#6E756C]">Auth Method</span>
                  <span className="text-xs font-mono text-[#cc9933]">{authMethod}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#6E756C]">Member Since</span>
                  <span className="text-xs font-mono text-[#bac4b8]">
                    {new Date(user.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <SectionLabel label="Session" />
              <div className="bg-[#141414] border border-[#bac4b8]/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-white font-medium">Sign Out</p>
                    <p className="text-xs text-[#6E756C] mt-1 font-mono">
                      You&apos;ll need to sign in again to access your archive.
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border border-[#bac4b8]/15 hover:border-red-500/40 hover:text-red-400 text-[10px] font-mono tracking-wider text-[#bac4b8] transition-all duration-200 uppercase cursor-pointer"
                  >
                    <LogOut size={12} />
                    Sign Out
                  </button>
                </div>
              </div>

              <SectionLabel label="Danger Zone" />
              <div className="bg-[#141414] border border-red-500/15 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-red-500/60 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">Delete Account</p>
                    <p className="text-xs text-[#6E756C] mt-1 font-mono leading-relaxed">
                      Permanently delete your Lumina account and all associated data. 
                      This action cannot be undone. Your Google Drive files remain untouched.
                    </p>
                    <button
                      disabled
                      className="mt-4 px-4 py-2 border border-red-500/20 text-red-500/40 text-[10px] font-mono tracking-wider uppercase cursor-not-allowed"
                    >
                      Delete Account — Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
