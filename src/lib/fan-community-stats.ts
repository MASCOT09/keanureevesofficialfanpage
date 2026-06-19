import { normalizeMembershipStatus, normalizeMembershipTier } from "@/lib/membership";
import type { AdminUserSummary } from "@/lib/repository";

export interface FanCommunityStats {
  totalFans: number;
  membership: {
    silver: number;
    gold: number;
    platinum: number;
    none: number;
  };
  byCountry: { country: string; count: number }[];
  unknownCountry: number;
}

export function buildFanCommunityStats(users: AdminUserSummary[]): FanCommunityStats {
  const fans = users.filter((user) => user.role === "fan");
  const membership = { silver: 0, gold: 0, platinum: 0, none: 0 };
  const countryMap = new Map<string, number>();
  let unknownCountry = 0;

  for (const fan of fans) {
    const tier = normalizeMembershipTier(fan.membership_tier);
    const status = normalizeMembershipStatus(fan.membership_status);

    if (status === "active" && tier !== "none") {
      membership[tier] += 1;
    } else {
      membership.none += 1;
    }

    const country = fan.country?.trim();
    if (country) {
      countryMap.set(country, (countryMap.get(country) ?? 0) + 1);
    } else {
      unknownCountry += 1;
    }
  }

  const byCountry = [...countryMap.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));

  return {
    totalFans: fans.length,
    membership,
    byCountry,
    unknownCountry,
  };
}
