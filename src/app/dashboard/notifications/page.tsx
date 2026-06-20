import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getNotificationsForUser, markAllNotificationsAsRead } from "@/lib/repository";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardEmptyState } from "@/components/dashboard/ui/DashboardEmptyState";
import { formatDashboardDateTime } from "@/lib/dashboard-utils";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await markAllNotificationsAsRead(user.id);
  revalidatePath("/dashboard", "layout");

  const notifications = await getNotificationsForUser(user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <DashboardPageHeader
        eyebrow="Alerts"
        title="Notifications"
        description="Stay up to date with giveaways, events, and account activity."
      />

      {!notifications.length ? (
        <DashboardEmptyState
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
          title="No notifications"
          description="You're all caught up. New alerts will show here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <article
              key={n.id}
              className={`glass flex items-start gap-4 rounded-[16px] p-5 ${!n.is_read ? "border-accent/20 bg-accent/5" : ""}`}
            >
              <div
                className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  !n.is_read ? "bg-accent/15 text-accent" : "bg-white/5 text-muted"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h2 className="font-medium text-foreground">{n.title}</h2>
                  {!n.is_read && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                      Unread
                    </span>
                  )}
                  <span className="text-xs text-muted">{formatDashboardDateTime(n.created_at)}</span>
                </div>
                <p className="text-sm text-muted">{n.message}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
