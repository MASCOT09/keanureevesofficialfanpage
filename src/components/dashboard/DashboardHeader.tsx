"use client";

import Link from "next/link";
import { branding } from "@/lib/branding";

export function DashboardHeader({ displayName }: { displayName: string }) {
  const handleSignOut = async () => {
    const { logoutAction } = await import("@/app/actions/auth-actions");
    await logoutAction();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-[#0F0F10]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="group flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-display text-xs text-accent">
              KR
            </span>
            <div className="hidden sm:block">
              <p className="font-display text-sm text-foreground transition-colors group-hover:text-accent">
                {branding.celebrityName}
              </p>
              <p className="text-[10px] uppercase tracking-[0.35em] text-accent">Member Portal</p>
            </div>
          </Link>
          <span className="hidden rounded-full border border-accent/25 bg-accent/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-accent md:inline-flex">
            Members Only
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <span className="hidden text-sm text-muted sm:inline">{displayName}</span>
          <Link
            href="/"
            className="text-sm tracking-wide text-muted transition-colors duration-300 hover:text-foreground"
          >
            Public Site
          </Link>
          <button
            onClick={handleSignOut}
            className="rounded-full border border-border px-4 py-2 text-sm tracking-wide text-muted transition-all duration-300 hover:border-accent/40 hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
