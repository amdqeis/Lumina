"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, type User } from "@/lib/api";
import { Loader2, Save, Link2, Globe } from "lucide-react";

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="index-label">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-dim">{icon}</span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-bg-secondary border border-white/10 focus:border-white/25 outline-none py-2.5 text-sm text-fg-bright placeholder:text-fg-dim rounded-sm transition-colors ${
            icon ? "pl-9 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoading: authLoading, refresh } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    display_name: "",
    username: "",
    bio: "",
    instagram: "",
    portfolio: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [authLoading, user, router]);

  // Pre-fill form from user
  useEffect(() => {
    if (user) {
      setForm({
        display_name: user.display_name || "",
        username: user.username || "",
        bio: user.bio || "",
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
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to save. Try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 size={20} className="text-fg-dim animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh pt-20 px-4 md:px-8 pb-20 max-w-xl mx-auto">
      <div className="pt-8 mb-8">
        <span className="index-label">[ SETTINGS ]</span>
        <h1 className="font-editorial text-4xl text-fg-bright mt-2">Profile</h1>
      </div>

      <div className="divider mb-8" />

      <form
        onSubmit={(e) => { e.preventDefault(); handleSave(); }}
        className="flex flex-col gap-5"
      >
        {/* Avatar display (read-only, from Google) */}
        {user?.avatar_url && (
          <div className="flex items-center gap-4 mb-2">
            <img
              src={user.avatar_url}
              alt={user.display_name || ""}
              className="w-14 h-14 rounded-full border border-white/10 object-cover"
            />
            <div>
              <p className="text-fg-bright text-sm">{user.display_name}</p>
              <p className="index-label mt-0.5">Avatar synced from Google</p>
            </div>
          </div>
        )}

        <Field
          label="Display Name"
          name="display_name"
          value={form.display_name}
          onChange={set("display_name")}
          placeholder="Your name"
        />
        <Field
          label="Username"
          name="username"
          value={form.username}
          onChange={set("username")}
          placeholder="your-handle"
        />
        <div className="flex flex-col gap-1.5">
          <label className="index-label">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={(e) => set("bio")(e.target.value)}
            placeholder="A short description of yourself and your photography..."
            rows={3}
            className="w-full bg-bg-secondary border border-white/10 focus:border-white/25 outline-none px-4 py-2.5 text-sm text-fg-bright placeholder:text-fg-dim rounded-sm transition-colors resize-none"
          />
        </div>
        <Field
          label="Instagram"
          name="instagram"
          value={form.instagram}
          onChange={set("instagram")}
          placeholder="@yourhandle"
          icon={<Link2 size={12} />}
        />
        <Field
          label="Portfolio / Website"
          name="portfolio"
          value={form.portfolio}
          onChange={set("portfolio")}
          placeholder="https://yoursite.com"
          icon={<Globe size={12} />}
        />

        {/* Status feedback */}
        {success && (
          <p className="index-label text-fg-bright">✓ Profile saved successfully</p>
        )}
        {error && (
          <p className="index-label text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 py-3 bg-fg-bright text-bg text-sm font-medium hover:bg-fg transition-colors duration-300 disabled:opacity-60 rounded-sm mt-2"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
