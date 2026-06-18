import type { Metadata } from "next";
import { getDashboardData } from "@/lib/dashboard-data";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const data = await getDashboardData();
  if (!data) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <DashboardPageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Manage your account preferences. More options coming soon."
      />

      <div className="glass space-y-6 rounded-[18px] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <p className="font-medium text-foreground">Email notifications</p>
            <p className="text-sm text-muted">Receive alerts for giveaways and events</p>
          </div>
          <div className="rounded-full bg-accent/20 px-3 py-1 text-xs text-accent">Enabled</div>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <p className="font-medium text-foreground">Signed in as</p>
            <p className="text-sm text-muted">{data.email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-foreground">Member since</p>
            <p className="text-sm text-muted">{data.stats.memberSince}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
