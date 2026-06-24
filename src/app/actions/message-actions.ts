"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { saveMessageImage } from "@/lib/message-image";
import { createFanMessageThread, getProfileById, replyAsFan } from "@/lib/repository";

async function parseMessageImage(userId: string, formData: FormData): Promise<string | null> {
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) return null;
  return saveMessageImage(userId, image);
}

export async function createFanMessageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("You must be logged in.");

  const profile = await getProfileById(user.id);
  const subject = (formData.get("subject") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const imageUrl = await parseMessageImage(user.id, formData);

  if (!subject) {
    throw new Error("Subject and message are required.");
  }
  if (!body && !imageUrl) {
    throw new Error("Subject and message are required.");
  }

  const threadId = await createFanMessageThread({
    userId: user.id,
    displayName: profile?.display_name ?? user.email,
    subject,
    body: body || "(Image)",
    imageUrl,
  });

  revalidatePath("/dashboard/messages");
  redirect(`/dashboard/messages/${threadId}`);
}

export async function replyAsFanAction(threadId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("You must be logged in.");

  const profile = await getProfileById(user.id);
  const body = (formData.get("body") as string)?.trim();
  const imageUrl = await parseMessageImage(user.id, formData);

  await replyAsFan({
    userId: user.id,
    displayName: profile?.display_name ?? user.email,
    threadId,
    body,
    imageUrl,
  });

  revalidatePath("/dashboard/messages");
  revalidatePath(`/dashboard/messages/${threadId}`);
  revalidatePath("/admin/messages");
  redirect(`/dashboard/messages/${threadId}?sent=1`);
}
