import type { Metadata } from "next";
import { getContactLinks } from "@/lib/repository";
import { getCurrentMembership } from "@/lib/auth";
import { hasActiveMembership } from "@/lib/membership";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { MembershipPrivateDmsGrid } from "@/components/membership/MembershipPrivateDmsGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Private DMs",
  robots: { index: false, follow: false },
};

export default async function DashboardContactPage() {
  const [links, membership] = await Promise.all([getContactLinks(), getCurrentMembership()]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <DashboardPageHeader
        eyebrow="Direct Access"
        title="Private DMs"
        description="Keanu Reeves contact and Keanu Reeves Manager Team — pick WhatsApp, Zangi, or Telegram to open chat."
      />

      {!hasActiveMembership(membership) && !membership.isAdmin ? (
        <EmptyState
          title="Membership required"
          description="Apply for Silver, Gold, or Platinum membership to unlock private messaging."
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
