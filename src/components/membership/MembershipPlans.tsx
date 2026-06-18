"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { applyForMembershipAction } from "@/app/actions/membership-actions";
import {
  MEMBERSHIP_PLANS,
  getMembershipLabel,
  getTierRank,
  hasActiveMembership,
  isMembershipUpgrade,
} from "@/lib/membership";
import type { ContactLink } from "@/types/database";
import type { MembershipApplication, MembershipTier } from "@/types/membership";
import { UpgradeModal } from "@/components/membership/UpgradeModal";

export function MembershipPlans({
  currentTier,
  currentStatus,
  latestApplication,
  teamLinks,
}: {
  currentTier: MembershipTier;
  currentStatus: string;
  latestApplication: MembershipApplication | null;
  teamLinks: ContactLink[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgradeModal, setUpgradeModal] = useState<{
    title: string;
    message: string;
    requiredTierLabel: string;
  } | null>(null);

  const handleApply = (tier: MembershipApplication["tier"]) => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await applyForMembershipAction(tier);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage("Application submitted. The team will review it shortly.");
      router.refresh();
    });
  };

  const handlePlanClick = (plan: (typeof MEMBERSHIP_PLANS)[number]) => {
    const isActive = currentStatus === "active" && hasActiveMembership({ tier: currentTier, status: "active" });

    if (isActive && plan.tier === currentTier) {
      return;
    }

    if (isActive && isMembershipUpgrade(currentTier, plan.tier)) {
      setUpgradeModal({
        title: `Upgrade to ${plan.name}`,
        message: `${plan.name} (${plan.price}) unlocks additional fan benefits. Reach out to the manager team to complete your upgrade.`,
        requiredTierLabel: getMembershipLabel(plan.tier),
      });
      return;
    }

    if (isActive && getTierRank(plan.tier) < getTierRank(currentTier)) {
      return;
    }

    handleApply(plan.tier);
  };

  return (
    <div className="space-y-8">
      {currentStatus === "active" && currentTier !== "none" && (
        <div className="rounded-[16px] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
          Your current plan is active. Contact the management team to upgrade to a higher tier.
        </div>
      )}

      {currentStatus === "pending" && (
        <div className="rounded-[16px] border border-accent/20 bg-accent/10 px-5 py-4 text-sm text-accent">
          Your membership application is under review
          {latestApplication ? ` (${latestApplication.tier}, $${latestApplication.amount})` : ""}.
        </div>
      )}

      {message && (
        <div className="rounded-[16px] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-[16px] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {MEMBERSHIP_PLANS.map((plan) => {
          const isActivePlan =
            currentStatus === "active" && currentTier === plan.tier;
          const isUpgrade =
            currentStatus === "active" &&
            currentTier !== "none" &&
            isMembershipUpgrade(currentTier, plan.tier);
          const isLowerTier =
            currentStatus === "active" &&
            currentTier !== "none" &&
            getTierRank(plan.tier) < getTierRank(currentTier);
          const disabled = pending || currentStatus === "pending" || isActivePlan || isLowerTier;

          let buttonLabel = `Apply for ${plan.name}`;
          if (pending) buttonLabel = "Submitting...";
          else if (isActivePlan) buttonLabel = "Current plan";
          else if (isLowerTier) buttonLabel = "Included in your plan";
          else if (isUpgrade) buttonLabel = "Upgrade plan";

          return (
            <article key={plan.tier} className="luxury-card flex flex-col p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-accent">{plan.name}</p>
              <p className="font-display mt-4 text-4xl text-foreground">${plan.price}</p>
              <p className="mt-3 text-sm text-muted">{plan.description}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-muted">
                {plan.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-accent">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handlePlanClick(plan)}
                className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {buttonLabel}
              </button>
            </article>
          );
        })}
      </div>

      <UpgradeModal
        open={!!upgradeModal}
        title={upgradeModal?.title ?? ""}
        message={upgradeModal?.message ?? ""}
        requiredTierLabel={upgradeModal?.requiredTierLabel ?? ""}
        teamLinks={teamLinks}
        onClose={() => setUpgradeModal(null)}
      />
    </div>
  );
}
