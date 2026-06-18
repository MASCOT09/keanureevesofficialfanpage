export type MembershipTier = "none" | "silver" | "gold" | "platinum";

export type MembershipStatus = "none" | "pending" | "active";

export type MembershipApplicationStatus = "pending" | "approved" | "rejected";

export interface MembershipInfo {
  tier: MembershipTier;
  status: MembershipStatus;
}

export interface MembershipApplication {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  tier: Exclude<MembershipTier, "none">;
  amount: number;
  status: MembershipApplicationStatus;
  created_at: string;
  reviewed_at: string | null;
}
