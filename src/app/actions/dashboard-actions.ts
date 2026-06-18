"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { removeUserAvatarFiles, saveUserAvatar } from "@/lib/avatar";
import { updateUserAvatar, updateUserProfile } from "@/lib/repository";

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated.");

  const displayName = (formData.get("display_name") as string)?.trim();
  const country = (formData.get("country") as string)?.trim() || null;

  if (!displayName) throw new Error("Display name is required.");

  await updateUserProfile(user.id, { displayName, country });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
}

export async function uploadProfileAvatar(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated.");

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please choose an image to upload.");
  }

  const avatarUrl = await saveUserAvatar(user.id, file);
  await updateUserAvatar(user.id, avatarUrl);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");

  return { avatarUrl };
}

export async function removeProfileAvatar() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated.");

  removeUserAvatarFiles(user.id);
  await updateUserAvatar(user.id, null);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
}

/** @deprecated Use updateProfile */
export async function updateDisplayName(formData: FormData) {
  return updateProfile(formData);
}
