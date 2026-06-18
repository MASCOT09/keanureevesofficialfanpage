import Link from "next/link";
import { DashboardEmptyState } from "@/components/dashboard/ui/DashboardEmptyState";
import { GiveawayCountdown } from "@/components/dashboard/overview/GiveawayCountdown";
import { getGiveawayPrize } from "@/lib/dashboard-utils";
import type { DashboardActiveGiveaway } from "@/lib/dashboard-data";

export function ActiveGiveawaysSection({
  giveaways,
}: {
  giveaways: DashboardActiveGiveaway[];
}) {
  return (
    <section className="glass rounded-[20px] p-6 sm:p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.35em] text-accent">Prizes</p>
          <h2 className="font-display text-xl text-foreground sm:text-2xl">Active Giveaways</h2>
        </div>
        {giveaways.length > 0 && (
          <Link
            href="/giveaways"
            className="shrink-0 text-sm tracking-wide text-muted transition-colors hover:text-accent"
          >
            Browse all →
          </Link>
        )}
      </div>

      {!giveaways.length ? (
        <DashboardEmptyState
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          }
          title="No active giveaways"
          description="New giveaways will be announced soon. Check back for exclusive prizes."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {giveaways.map((giveaway) => (
            <article
              key={giveaway.id}
              className="group overflow-hidden rounded-[16px] border border-border/60 bg-card/40 transition-all duration-300 hover:border-accent/25 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            >
              <div className="relative aspect-[16/9] bg-gradient-to-br from-[#1C1C1E] to-[#0F0F10]">
                {giveaway.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={giveaway.image_url}
                    alt={giveaway.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <svg className="h-12 w-12 text-accent/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                )}
                <div className="absolute right-3 top-3">
                  <GiveawayCountdown endsAt={giveaway.ends_at} />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display mb-2 text-lg text-foreground transition-colors group-hover:text-accent">
                  {giveaway.title}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-muted">
                  {getGiveawayPrize(giveaway.description, giveaway.title)}
                </p>
                <Link
                  href={`/giveaways/${giveaway.id}`}
                  className={`inline-flex rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                    giveaway.hasEntered
                      ? "border border-border bg-white/5 text-muted"
                      : "border border-accent/40 bg-accent/15 text-accent hover:bg-accent/25"
                  }`}
                >
                  {giveaway.hasEntered ? "Entered" : "Enter"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
