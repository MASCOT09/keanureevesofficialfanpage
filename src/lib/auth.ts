import { cache } from "react";
import { getSession } from "@/lib/session";
import {
  findUserById,
  getProfileById,
  isExcelBackendReady,
} from "@/lib/excel/repository";
import { normalizeMembershipStatus, normalizeMembershipTier } from "@/lib/membership";
import type { MembershipInfo } from "@/types/membership";

export interface SessionUser {
  id: string;
  email: string;
  role: "fan" | "admin";
}

async function loadCurrentUser(): Promise<SessionUser | null> {
  if (!isExcelBackendReady()) return null;

  const session = await getSession();
  if (!session) return null;

  const user = await findUserById(session.sub);
  if (!user) return null;

  return { id: user.id, email: user.email, role: user.role };
}

async function loadCurrentMembership(): Promise<MembershipInfo & { isAdmin: boolean }> {
  const user = await getCurrentUser();
  if (!user) {
    return { tier: "none", status: "none", isAdmin: false };
  }

  if (user.role === "admin") {
    return { tier: "platinum", status: "active", isAdmin: true };
  }

  const profile = await getProfileById(user.id);
  return {
    tier: normalizeMembershipTier(profile?.membership_tier),
    status: normalizeMembershipStatus(profile?.membership_status),
    isAdmin: false,
  };
}

async function loadCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  return getProfileById(user.id);
}

export const getCurrentUser = cache(loadCurrentUser);
export const getCurrentMembership = cache(loadCurrentMembership);
export const getCurrentProfile = cache(loadCurrentProfile);

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "admin";
}
