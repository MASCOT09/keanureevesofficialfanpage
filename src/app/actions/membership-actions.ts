"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createMembershipApplication } from "@/lib/repository";
import type { MembershipApplication } from "@/types/membership";

export async function applyForMembershipAction(tier: MembershipApplication["tier"]) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be logged in to apply." };
  }

  if (user.role === "admin") {
    return { error: "Admins already have full access." };
  }

  try {
    await createMembershipApplication(user.id, tier);
    revalidatePath("/dashboard/membership");
    revalidatePath("/dashboard");
    revalidatePath("/admin/memberships");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not submit application.",
    };
  }
}
