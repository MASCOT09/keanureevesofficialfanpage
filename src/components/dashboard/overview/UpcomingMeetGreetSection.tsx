import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { DashboardEmptyState } from "@/components/dashboard/ui/DashboardEmptyState";
import {
  formatDashboardDate,
  formatDashboardTime,
} from "@/lib/dashboard-utils";
import type { DashboardEventRegistration } from "@/lib/dashboard-data";

export function UpcomingMeetGreetSection({
  events,
}: {
  events: DashboardEventRegistration[];
}) {
  return (
    <section className="glass rounded-[20px] p-6 sm:p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.35em] text-accent">Events</p>
          <h2 className="font-display text-xl text-foreground sm:text-2xl">Upcoming Meet & Greet</h2>
        </div>
        {events.length > 0 && (
          <Link
            href="/dashboard/meet-and-greet"
            className="shrink-0 text-sm tracking-wide text-muted transition-colors hover:text-accent"
          >
            View all →
          </Link>
        )}
      </div>

      {!events.length ? (
        <DashboardEmptyState
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="No meet & greet bookings"
          description="Register for an upcoming event to see it listed here."
          action={
            <Link
              href="/meet-and-greet"
              className="rounded-full border border-accent/30 bg-accent/10 px-5 py-2 text-sm text-accent transition-colors hover:bg-accent/20"
            >
              Browse events
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((reg) => (
            <Link
              key={reg.id}
              href={`/meet-and-greet/${reg.event.id}`}
              className="group rounded-[14px] border border-border/60 bg-card/40 p-5 transition-all duration-300 hover:border-accent/25 hover:bg-card/70"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant={reg.status === "confirmed" ? "active" : "waitlist"}>
                  {reg.status === "confirmed" ? "Confirmed" : "Waitlist"}
                </Badge>
              </div>
              <h3 className="font-display mb-3 text-lg text-foreground transition-colors group-hover:text-accent">
                {reg.event.title}
              </h3>
              <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
                <p>
                  <span className="text-muted">Date:</span>{" "}
                  {formatDashboardDate(reg.event.event_date)}
                </p>
                <p>
                  <span className="text-muted">Time:</span>{" "}
                  {formatDashboardTime(reg.event.event_date)}
                </p>
                {reg.event.location && (
                  <p className="sm:col-span-2">
                    <span className="text-muted">Location:</span> {reg.event.location}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
