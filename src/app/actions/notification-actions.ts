"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { markAllNotificationsAsRead } from "@/lib/repository";

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  try {
    await markAllNotificationsAsRead(user.id);
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/notifications");
  } catch (error) {
    console.error("[notifications] mark all read failed", error);
  }
}
