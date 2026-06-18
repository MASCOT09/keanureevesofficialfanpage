import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { findUserById, isExcelBackendReady } from "@/lib/excel/repository";
import { normalizeMembershipStatus, normalizeMembershipTier } from "@/lib/membership";

export async function GET() {
  if (!isExcelBackendReady()) {
    return NextResponse.json({ user: null });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await findUserById(session.sub);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      display_name: user.display_name,
      membership_tier:
        user.role === "admin" ? "platinum" : normalizeMembershipTier(user.membership_tier),
      membership_status:
        user.role === "admin" ? "active" : normalizeMembershipStatus(user.membership_status),
    },
  });
}
