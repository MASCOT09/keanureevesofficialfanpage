"use client";

import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopBar } from "./DashboardTopBar";
import { AdminControlBanner } from "./AdminControlBanner";
import { PushNotificationPrompt } from "@/components/PushNotificationPrompt";

export interface DashboardUser {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  role: string;
  memberSince: string;
  unreadNotifications: number;
  unreadMessages: number;
  unreadFanReplies: number;
  avatarUrl: string | null;
  membershipTier: string;
  membershipLabel: string;
}

export function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-shell flex min-h-screen">
      {/* Desktop sidebar */}
      <DashboardSidebar
        user={user}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        className="hidden lg:flex"
      />

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <DashboardSidebar
        user={user}
        collapsed={false}
        onToggle={() => setMobileOpen(false)}
        className={`fixed inset-y-0 left-0 z-50 lg:hidden ${mobileOpen ? "flex" : "hidden"}`}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar
          user={user}
          onMenuClick={() => setMobileOpen(true)}
          onSidebarToggle={() => setCollapsed(!collapsed)}
        />
        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {user.role === "admin" && <AdminControlBanner />}
          {children}
        </main>
        <PushNotificationPrompt />
      </div>
    </div>
  );
}
