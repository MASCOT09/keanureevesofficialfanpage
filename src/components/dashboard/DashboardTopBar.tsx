"use client";

import Link from "next/link";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import type { DashboardUser } from "./DashboardShell";

export function DashboardTopBar({
  user,
  onMenuClick,
  onSidebarToggle,
}: {
  user: DashboardUser;
  onMenuClick: () => void;
  onSidebarToggle: () => void;
}) {
  return (
    <header className="theme-surface sticky top-0 z-30 border-b border-border/80 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted lg:hidden"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={onSidebarToggle}
          className="hidden rounded-lg p-2 text-muted lg:block"
          aria-label="Toggle sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>

        {/* Search (UI only) */}
        <div className="hidden flex-1 sm:block sm:max-w-md">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search..."
              disabled
              className="w-full rounded-full border border-border bg-card/60 py-2.5 pl-10 pr-4 text-sm text-muted outline-none placeholder:text-muted/60"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4 sm:gap-6">
          {/* Welcome message */}
          <p className="hidden text-sm text-foreground md:block">
            Welcome back, <span className="font-medium text-accent">{user.firstName}</span> 👋
          </p>

          {/* Notifications bell */}
          <Link
            href="/dashboard/notifications"
            className="relative rounded-full p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {user.unreadNotifications > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-on-accent">
                {user.unreadNotifications > 9 ? "9+" : user.unreadNotifications}
              </span>
            )}
          </Link>

          {/* Avatar */}
          <Link
            href="/dashboard/profile"
            className="transition-opacity hover:opacity-90"
            title={user.displayName}
          >
            <UserAvatar name={user.displayName} avatarUrl={user.avatarUrl} size="sm" />
          </Link>
        </div>
      </div>

      {/* Mobile welcome */}
      <div className="border-t border-border/40 px-4 pb-3 md:hidden">
        <p className="text-sm text-foreground">
          Welcome back, <span className="font-medium text-accent">{user.firstName}</span> 👋
        </p>
      </div>
    </header>
  );
}
