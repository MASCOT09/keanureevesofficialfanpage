"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth-actions";
import { removeProfileAvatar, uploadProfileAvatar, updateProfile } from "@/app/actions/dashboard-actions";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import type { DashboardData } from "@/lib/dashboard-data";
import { SubmitButton } from "@/components/ui/Button";
import { CountryPicker } from "@/components/ui/CountryPicker";

export function DashboardProfile({ data, hideTitle }: { data: DashboardData; hideTitle?: boolean }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayName = data.profile.display_name ?? "Fan";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(data.profile.avatar_url);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

  useEffect(() => {
    setAvatarUrl(data.profile.avatar_url);
  }, [data.profile.avatar_url]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData(e.currentTarget);
      await updateProfile(formData);
      setSuccess("Profile updated successfully.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    setError(null);
    setSuccess(null);

    const preview = URL.createObjectURL(file);
    setAvatarUrl(preview);

    try {
      const formData = new FormData();
      formData.set("avatar", file);
      const result = await uploadProfileAvatar(formData);
      setAvatarUrl(result.avatarUrl);
      setSuccess("Profile photo updated.");
      router.refresh();
    } catch (err) {
      setAvatarUrl(data.profile.avatar_url);
      setError(err instanceof Error ? err.message : "Could not upload photo.");
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await removeProfileAvatar();
      setAvatarUrl(null);
      setSuccess("Profile photo removed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove photo.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      await logoutAction();
    } catch {
      setSignOutLoading(false);
    }
  };

  return (
    <section id="profile" className="scroll-mt-28">
      {!hideTitle && (
        <div className="mb-6">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-accent">Account</p>
          <h2 className="font-display text-2xl text-foreground sm:text-3xl">Your Profile</h2>
        </div>
      )}

      <div className="glass rounded-[18px] p-6 sm:p-8">
        <div className="mb-8 flex flex-col items-center border-b border-border pb-8 sm:flex-row sm:items-start sm:gap-8">
          <div className="relative shrink-0">
            <UserAvatar name={displayName} avatarUrl={avatarUrl} size="lg" />
            {avatarLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col items-center sm:mt-2 sm:items-start">
            <p className="mb-1 text-xs uppercase tracking-[0.25em] text-muted">Profile photo</p>
            <p className="mb-4 max-w-sm text-center text-sm text-muted sm:text-left">
              Upload a photo so other fans and the team can recognize you. JPG, PNG, or WebP up to 2 MB.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="rounded-full border border-accent/40 bg-accent/15 px-5 py-2.5 text-sm font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-50"
              >
                {avatarUrl ? "Change photo" : "Upload photo"}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={avatarLoading}
                  className="rounded-full border border-border px-5 py-2.5 text-sm text-muted transition-colors hover:border-red-500/30 hover:text-red-400 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
              aria-label="Upload profile photo"
            />
          </div>
        </div>

        <div className="mb-8 grid gap-6 border-b border-border pb-8 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.25em] text-muted">Email</p>
            <p className="text-foreground">{data.email}</p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.25em] text-muted">Member Since</p>
            <p className="text-foreground">{data.stats.memberSince}</p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.25em] text-muted">Role</p>
            <p className="capitalize text-foreground">{data.profile.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md space-y-5">
          <div>
            <label htmlFor="display_name" className="mb-2 block text-sm tracking-wide text-muted">
              Display name
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              defaultValue={data.profile.display_name ?? ""}
              required
              className="w-full rounded-[16px] border border-border bg-card/80 px-4 py-3.5 text-foreground outline-none transition-all duration-300 placeholder:text-muted/40 focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
            />
          </div>

          <CountryPicker
            id="country"
            name="country"
            defaultValue={data.profile.country ?? ""}
            placeholder="Search or select your country"
          />

          {error && (
            <p className="rounded-[16px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-[16px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {success}
            </p>
          )}

          <SubmitButton loading={loading} className="!w-auto px-8">
            Save changes
          </SubmitButton>
        </form>

        <div className="mt-10 max-w-md border-t border-border pt-8">
          <p className="mb-1 text-xs uppercase tracking-[0.25em] text-muted">Session</p>
          <p className="mb-4 text-sm text-muted">Sign out of your fan account on this device.</p>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signOutLoading}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {signOutLoading ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </section>
  );
}
