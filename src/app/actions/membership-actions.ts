"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createMembershipApplication, getAdminEmails, getProfileById } from "@/lib/repository";
import { sendMembershipApplicationEmailAlerts } from "@/lib/message-email-notifications";
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
    const profile = await getProfileById(user.id);
    const fanName = profile?.display_name ?? user.email;

    revalidatePath("/dashboard/membership");
    revalidatePath("/dashboard");
    revalidatePath("/admin/memberships");
    revalidatePath("/dashboard/notifications");

    after(async () => {
      try {
        const adminEmails = await getAdminEmails();
        await sendMembershipApplicationEmailAlerts({
          fanName,
          fanEmail: user.email,
          tier,
          adminEmails,
        });
      } catch (error) {
        console.error("[email] membership application after() failed", error);
      }
    });

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not submit application.",
    };
  }
}
