import Link from "next/link";
import type { DashboardEventRegistration } from "@/lib/dashboard-data";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export function DashboardEvents({ registrations }: { registrations: DashboardEventRegistration[] }) {
  return (
    <section id="events" className="scroll-mt-28">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-accent">Events</p>
          <h2 className="font-display text-2xl text-foreground sm:text-3xl">My Registrations</h2>
        </div>
        <Link
          href="/meet-and-greet"
          className="shrink-0 text-sm tracking-wide text-muted transition-colors duration-300 hover:text-accent"
        >
          Browse all →
        </Link>
      </div>

      {!registrations.length ? (
        <EmptyState
          title="No event registrations yet"
          description="Register for a meet & greet to see it listed here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {registrations.map((reg) => (
            <Link
              key={reg.id}
              href={`/meet-and-greet/${reg.event.id}`}
              className="glass group rounded-[18px] p-6 transition-all duration-300 hover:border-accent/25 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] sm:p-8"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <Badge variant={reg.status === "confirmed" ? "active" : "waitlist"}>
                      {reg.status === "confirmed" ? "Confirmed" : "Waitlist"}
                    </Badge>
                    <span className="text-xs tracking-wide text-muted">
                      Registered {new Date(reg.registered_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-foreground transition-colors duration-300 group-hover:text-accent">
                    {reg.event.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {new Date(reg.event.event_date).toLocaleString()}
                    {reg.event.location && ` · ${reg.event.location}`}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:opacity-100">
                  View
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
