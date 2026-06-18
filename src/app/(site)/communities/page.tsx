import type { Metadata } from "next";
import { getCommunities } from "@/lib/repository";
import { getSiteButtonMap } from "@/lib/site-buttons";
import { pickSiteButton } from "@/lib/site-button-utils";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { CommunityCard } from "@/components/communities/CommunityCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata, buildWebPageJsonLd } from "@/lib/seo";

const title = "Communities";
const description = "Join official Keanu Reeves fan communities on Telegram and more.";

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: "/communities",
});

export const revalidate = 60;

export default async function CommunitiesPage() {
  const [communities, session, buttons] = await Promise.all([
    getCommunities(),
    getSession(),
    getSiteButtonMap(),
  ]);
  const isLoggedIn = !!session;
  const guestJoin = pickSiteButton(buttons, "community.guest_join");

  return (
    <>
      <JsonLd data={buildWebPageJsonLd({ title, description, path: "/communities" })} />
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:px-10">
        <PageHeader
          eyebrow="Connect"
          title="Communities"
          description="Connect with fellow fans in our official community groups."
        />

        {!communities.length ? (
          <EmptyState
            title="No communities yet"
            description="Check back soon for official fan groups."
          />
        ) : (
          <section aria-label="Fan communities">
            <ul className="grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {communities.map((community) => (
                <li key={community.id}>
                  <CommunityCard
                    community={community}
                    isLoggedIn={isLoggedIn}
                    guestJoinHref={guestJoin.href}
                    guestJoinLabel={guestJoin.label}
                    guestJoinOpenInNewTab={guestJoin.openInNewTab}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
