import Link from "next/link";
import { hasActiveMembership } from "@/lib/membership";
import type { MembershipInfo } from "@/types/membership";

export function MembershipPromptBanner({
  membership,
}: {
  membership: MembershipInfo & { isAdmin?: boolean };
}) {
  if (membership.isAdmin || hasActiveMembership(membership)) {
    return null;
  }

  return (
    <div className="rounded-[16px] border border-accent/25 bg-accent/10 px-5 py-4 text-sm text-foreground">
      <p className="font-medium">Apply for membership to unlock fan benefits.</p>
      <p className="mt-1 text-muted">
        Silver ($100), Gold ($250), and Platinum ($500) tiers include giveaways, messaging, and
        more.
      </p>
      <Link
        href="/dashboard/membership"
        className="mt-4 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-medium text-on-accent"
      >
        View membership plans
      </Link>
    </div>
  );
}
