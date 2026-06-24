import type { Metadata } from "next";
import { getGiveaways } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { GiveawayCard } from "@/components/giveaways/GiveawayCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Giveaways",
  description: "Official fan giveaways and prize entries. Anyone can browse — sign in to enter.",
  path: "/giveaways",
});

export const revalidate = 60;

export default async function GiveawaysPage() {
  const giveaways = await getGiveaways();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:px-10">
      <PageHeader
        eyebrow="Win Big"
        title="Giveaways"
        description="Enter for a chance to win exclusive prizes. Browse freely — sign in to participate."
      />

      {!giveaways.length ? (
        <EmptyState
          title="No active giveaways"
          description="New giveaways will be announced soon. Check back later!"
        />
      ) : (
        <section aria-label="Active giveaways">
          <ul className="grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {giveaways.map((giveaway) => (
              <li key={giveaway.id}>
                <GiveawayCard giveaway={giveaway} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
