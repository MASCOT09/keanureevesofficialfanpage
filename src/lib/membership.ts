import type {
  MembershipInfo,
  MembershipStatus,
  MembershipTier,
} from "@/types/membership";

export const MEMBERSHIP_PLANS = [
  {
    tier: "silver" as const,
    name: "Silver Member",
    price: 100,
    description: "Entry-level fan access with limited perks.",
    highlights: [
      "Giveaway entries",
      "Team messages & notifications",
      "Contact manager team",
      "No direct Keanu contact",
      "No meet & greet registration",
    ],
  },
  {
    tier: "gold" as const,
    name: "Gold Member",
    price: 250,
    description: "Premium access including meet & greet opportunities.",
    highlights: [
      "Everything in Silver",
      "Meet & greet registration",
      "Contact manager team",
      "No direct Keanu contact",
    ],
  },
  {
    tier: "platinum" as const,
    name: "Platinum Member",
    price: 500,
    description: "Full VIP access including direct Keanu contact.",
    highlights: [
      "Everything in Gold",
      "Direct Keanu Reeves contact",
      "Highest priority fan experience",
    ],
  },
] as const;

export function normalizeMembershipTier(value: string | undefined | null): MembershipTier {
  if (value === "silver" || value === "gold" || value === "platinum") return value;
  return "none";
}

export function normalizeMembershipStatus(value: string | undefined | null): MembershipStatus {
  if (value === "pending" || value === "active") return value;
  return "none";
}

export function getMembershipPrice(tier: Exclude<MembershipTier, "none">): number {
  return MEMBERSHIP_PLANS.find((plan) => plan.tier === tier)?.price ?? 0;
}

export function getMembershipLabel(tier: MembershipTier): string {
  if (tier === "none") return "No membership";
  return MEMBERSHIP_PLANS.find((plan) => plan.tier === tier)?.name ?? tier;
}

export function hasActiveMembership(membership: MembershipInfo): boolean {
  return membership.status === "active" && membership.tier !== "none";
}

export function canContactManagement(membership: MembershipInfo, isAdmin = false): boolean {
  if (isAdmin) return true;
  return (
    hasActiveMembership(membership) &&
    (membership.tier === "silver" ||
      membership.tier === "gold" ||
      membership.tier === "platinum")
  );
}

export function canContactKeanu(membership: MembershipInfo, isAdmin = false): boolean {
  if (isAdmin) return true;
  return hasActiveMembership(membership) && membership.tier === "platinum";
}

export function canRegisterMeetAndGreet(membership: MembershipInfo, isAdmin = false): boolean {
  if (isAdmin) return true;
  return (
    hasActiveMembership(membership) &&
    (membership.tier === "gold" || membership.tier === "platinum")
  );
}

export function canEnterGiveaways(membership: MembershipInfo, isAdmin = false): boolean {
  if (isAdmin) return true;
  return hasActiveMembership(membership);
}

export function getUpgradeTargetForKeanu(): "platinum" {
  return "platinum";
}

export function getUpgradeTargetForMeetAndGreet(): "gold" {
  return "gold";
}

const TIER_RANK: Record<MembershipTier, number> = {
  none: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
};

export function getTierRank(tier: MembershipTier): number {
  return TIER_RANK[tier];
}

export function isMembershipUpgrade(
  currentTier: MembershipTier,
  targetTier: Exclude<MembershipTier, "none">
): boolean {
  return getTierRank(targetTier) > getTierRank(currentTier);
}
