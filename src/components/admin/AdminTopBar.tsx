"use client";

import Link from "next/link";

export function AdminTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="theme-surface sticky top-0 z-30 border-b border-border/80 backdrop-blur-xl lg:hidden">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted"
          aria-label="Open admin menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent">Admin</p>
          <p className="truncate font-display text-sm text-foreground">Site control panel</p>
        </div>
        <Link
          href="/dashboard"
          className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent"
        >
          Dashboard
        </Link>
      </div>
    </header>
  );
}
