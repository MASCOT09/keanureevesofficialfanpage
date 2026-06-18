import Link from "next/link";
import { DashboardEmptyState } from "@/components/dashboard/ui/DashboardEmptyState";
import { formatDashboardDateTime } from "@/lib/dashboard-utils";
import type { Notification } from "@/types/messages";

export function NotificationsPanel({ notifications }: { notifications: Notification[] }) {
  return (
    <section className="glass rounded-[20px] p-6 sm:p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.35em] text-accent">Alerts</p>
          <h2 className="font-display text-xl text-foreground sm:text-2xl">Notifications</h2>
        </div>
        {notifications.length > 0 && (
          <Link
            href="/dashboard/notifications"
            className="shrink-0 text-sm tracking-wide text-muted transition-colors hover:text-accent"
          >
            View all →
          </Link>
        )}
      </div>

      {!notifications.length ? (
        <DashboardEmptyState
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
          title="No notifications"
          description="You're all caught up. New alerts will appear here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <article
              key={n.id}
              className={`flex gap-3 rounded-[14px] border p-4 transition-colors ${
                !n.is_read
                  ? "border-accent/20 bg-accent/5"
                  : "border-border/60 bg-card/40"
              }`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  !n.is_read ? "bg-accent/15 text-accent" : "bg-white/5 text-muted"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-foreground">{n.title}</h3>
                  {!n.is_read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  )}
                </div>
                <p className="mb-1 line-clamp-2 text-sm text-muted">{n.message}</p>
                <p className="text-xs text-muted/80">{formatDashboardDateTime(n.created_at)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
