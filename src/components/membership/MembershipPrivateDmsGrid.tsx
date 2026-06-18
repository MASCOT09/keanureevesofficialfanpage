"use client";

import { useState } from "react";
import type { ContactLink } from "@/types/database";
import type { MembershipInfo } from "@/types/membership";
import {
  canContactKeanu,
  canContactManagement,
  getMembershipLabel,
  hasActiveMembership,
} from "@/lib/membership";
import { groupContactLinksByRecipient, getTeamContactLinks, pickContactLinkPerPlatform } from "@/lib/contact-dms";
import { RecipientContactCard } from "@/components/contact/RecipientContactCard";
import { UpgradeModal } from "@/components/membership/UpgradeModal";

export function MembershipPrivateDmsGrid({
  links,
  membership,
}: {
  links: ContactLink[];
  membership: MembershipInfo & { isAdmin?: boolean };
}) {
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    requiredTierLabel: string;
  } | null>(null);

  const sections = groupContactLinksByRecipient(links);
  const teamLinks = getTeamContactLinks(links);

  return (
    <>
      <div className="flex flex-col gap-6">
        {sections.map((section) => {
          const sectionLinks = pickContactLinkPerPlatform(section.links);
          const isKeanu = section.id === "keanu";
          const locked = isKeanu
            ? !canContactKeanu(membership, membership.isAdmin)
            : !canContactManagement(membership, membership.isAdmin);

          const lockReason = isKeanu
            ? {
                title: "Platinum membership required",
                message:
                  "Direct contact with Keanu Reeves is reserved for Platinum Members. Contact the management team to upgrade.",
                requiredTierLabel: getMembershipLabel("platinum"),
              }
            : {
                title: "Membership required",
                message:
                  "Apply for Silver, Gold, or Platinum membership to contact the manager team.",
                requiredTierLabel: "Silver Member or higher",
              };

          return (
            <RecipientContactCard
              key={section.id}
              title={section.title}
              description={section.description}
              links={sectionLinks}
              locked={locked}
              onLockedClick={() => setModal(lockReason)}
            />
          );
        })}
      </div>

      {!hasActiveMembership(membership) && !membership.isAdmin && (
        <p className="text-center text-sm text-muted">
          Apply for membership to unlock manager team contact. Platinum is required for Keanu
          Reeves direct contact.
        </p>
      )}

      <UpgradeModal
        open={!!modal}
        title={modal?.title ?? ""}
        message={modal?.message ?? ""}
        requiredTierLabel={modal?.requiredTierLabel ?? ""}
        teamLinks={teamLinks}
        onClose={() => setModal(null)}
      />
    </>
  );
}
