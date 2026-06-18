import type { Metadata } from "next";
import Link from "next/link";
import { getContactLinks } from "@/lib/excel/repository";
import { getCurrentMembership } from "@/lib/auth";
import { hasActiveMembership } from "@/lib/membership";
import { PageHeader } from "@/components/ui/PageHeader";
import { MembershipPrivateDmsGrid } from "@/components/membership/MembershipPrivateDmsGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildPageMetadata, privateRobots } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Private DMs",
  description: "Member-only direct messaging with Keanu Reeves and the manager team.",
  path: "/contact",
  robots: privateRobots,
});

export const revalidate = 60;

export default async function ContactPage() {
  const [links, membership] = await Promise.all([getContactLinks(), getCurrentMembership()]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20 lg:px-10">
      <PageHeader
        eyebrow="Direct Access"
        title="Private DMs"
        description="Two contact cards — Keanu Reeves contact and Keanu Reeves Manager Team — each with WhatsApp, Zangi, and Telegram."
      />

      {!membership.isAdmin && !hasActiveMembership(membership) ? (
        <EmptyState
          title="Membership required"
          description="Log in and apply for membership to unlock private messaging."
          action={
            <Link
              href="/dashboard/membership"
              className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent"
            >
              Apply for membership
            </Link>
          }
        />
      ) : !links.length ? (
        <EmptyState
          title="No contact links yet"
          description="Private DM options will appear here once configured."
        />
      ) : (
        <MembershipPrivateDmsGrid links={links} membership={membership} />
      )}
    </div>
  );
}
