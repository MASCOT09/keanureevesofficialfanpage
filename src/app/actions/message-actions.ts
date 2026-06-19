"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createFanMessageThread, getProfileById, replyAsFan } from "@/lib/repository";

export async function createFanMessageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("You must be logged in.");

  const profile = await getProfileById(user.id);
  const subject = (formData.get("subject") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();

  const threadId = await createFanMessageThread({
    userId: user.id,
    displayName: profile?.display_name ?? user.email,
    subject,
    body,
  });

  revalidatePath("/dashboard/messages");
  redirect(`/dashboard/messages/${threadId}`);
}

export async function replyAsFanAction(threadId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("You must be logged in.");

  const profile = await getProfileById(user.id);
  const body = (formData.get("body") as string)?.trim();

  await replyAsFan({
    userId: user.id,
    displayName: profile?.display_name ?? user.email,
    threadId,
    body,
  });

  revalidatePath("/dashboard/messages");
  revalidatePath(`/dashboard/messages/${threadId}`);
  revalidatePath("/admin/messages");
  redirect(`/dashboard/messages/${threadId}?sent=1`);
}
