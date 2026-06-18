import Link from "next/link";
import type { DashboardGiveawayEntry } from "@/lib/dashboard-data";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export function DashboardGiveaways({ entries }: { entries: DashboardGiveawayEntry[] }) {
  return (
    <section id="giveaways" className="scroll-mt-28">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-accent">Giveaways</p>
          <h2 className="font-display text-2xl text-foreground sm:text-3xl">My Entries</h2>
        </div>
        <Link
          href="/giveaways"
          className="shrink-0 text-sm tracking-wide text-muted transition-colors duration-300 hover:text-accent"
        >
          Browse all →
        </Link>
      </div>

      {!entries.length ? (
        <EmptyState
          title="No giveaway entries yet"
          description="Enter an active giveaway to see it listed here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((entry) => {
            const isActive =
              entry.giveaway.status === "active" &&
              new Date(entry.giveaway.ends_at) > new Date();

            return (
              <Link
                key={entry.id}
                href={`/giveaways/${entry.giveaway.id}`}
                className="glass group rounded-[18px] p-6 transition-all duration-300 hover:border-accent/25 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] sm:p-8"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <Badge variant={isActive ? "active" : "closed"}>
                        {isActive ? "Active" : "Closed"}
                      </Badge>
                      <span className="text-xs tracking-wide text-muted">
                        Entered {new Date(entry.entered_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-display text-xl text-foreground transition-colors duration-300 group-hover:text-accent">
                      {entry.giveaway.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted">
                      Ends {new Date(entry.giveaway.ends_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:opacity-100">
                    View
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
