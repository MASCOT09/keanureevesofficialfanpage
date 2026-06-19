import { AdminCard } from "@/components/admin/AdminForm";
import type { FanCommunityStats } from "@/lib/fan-community-stats";

export function FanCommunityStats({ stats }: { stats: FanCommunityStats }) {
  const summaryItems = [
    { label: "Total fans", value: stats.totalFans, accent: true },
    { label: "Silver", value: stats.membership.silver },
    { label: "Gold", value: stats.membership.gold },
    { label: "Platinum", value: stats.membership.platinum },
  ];

  return (
    <section className="mb-10" aria-label="Fan community statistics">
      <h2 className="font-display mb-6 text-2xl text-foreground">Fan statistics</h2>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryItems.map((item) => (
          <AdminCard key={item.label}>
            <p className="text-sm tracking-wide text-muted">{item.label}</p>
            <p
              className={`font-display mt-2 text-4xl ${item.accent ? "text-accent" : "text-foreground"}`}
            >
              {item.value}
            </p>
          </AdminCard>
        ))}
      </div>

      <AdminCard>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-accent">By country</p>
            <h3 className="font-display mt-2 text-xl text-foreground">Where your fans are from</h3>
          </div>
          {stats.unknownCountry > 0 && (
            <p className="text-sm text-muted">
              {stats.unknownCountry} fan{stats.unknownCountry === 1 ? "" : "s"} without a country
            </p>
          )}
        </div>

        {!stats.byCountry.length ? (
          <p className="text-sm text-muted">No country data yet — fans can set this when they sign up.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto rounded-[12px] border border-border/60">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-border bg-card/95 text-xs uppercase tracking-[0.2em] text-muted backdrop-blur">
                <tr>
                  <th className="px-4 py-3 font-medium">Country</th>
                  <th className="px-4 py-3 font-medium text-right">Fans</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {stats.byCountry.map((row) => (
                  <tr key={row.country} className="bg-card/20">
                    <td className="px-4 py-3 text-foreground">{row.country}</td>
                    <td className="px-4 py-3 text-right font-medium text-accent">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {stats.membership.none > 0 && (
          <p className="mt-4 text-sm text-muted">
            {stats.membership.none} fan{stats.membership.none === 1 ? "" : "s"} without an active
            membership badge.
          </p>
        )}
      </AdminCard>
    </section>
  );
}
