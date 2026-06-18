import type { Metadata } from "next";
import { getContactLinks } from "@/lib/excel/repository";
import { getCurrentMembership, getCurrentUser } from "@/lib/auth";
import { getTeamContactLinks } from "@/lib/contact-dms";
import { getLatestMembershipApplicationForUser } from "@/lib/excel/repository";
import { getMembershipLabel } from "@/lib/membership";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { MembershipPlans } from "@/components/membership/MembershipPlans";

export const metadata: Metadata = {
  title: "Membership",
  robots: { index: false, follow: false },
};

export default async function DashboardMembershipPage() {
  const [membership, user, contactLinks] = await Promise.all([
    getCurrentMembership(),
    getCurrentUser(),
    getContactLinks(),
  ]);
  const teamLinks = getTeamContactLinks(contactLinks);
  const latestApplication =
    user && !membership.isAdmin
      ? await getLatestMembershipApplicationForUser(user.id)
      : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <DashboardPageHeader
        eyebrow="Fan Membership"
        title="Apply for membership"
        description={
          membership.isAdmin
            ? "Admins have full Platinum access."
            : membership.status === "active"
              ? `You are a ${getMembershipLabel(membership.tier)}. Upgrade anytime for more access.`
              : "Choose Silver, Gold, or Platinum. The team will review your application."
        }
      />

      {membership.isAdmin ? (
        <div className="rounded-[16px] border border-border px-5 py-4 text-sm text-muted">
          Admin accounts bypass membership limits.
        </div>
      ) : (
        <MembershipPlans
          currentTier={membership.tier}
          currentStatus={membership.status}
          latestApplication={latestApplication}
          teamLinks={teamLinks}
        />
      )}
    </div>
  );
}
