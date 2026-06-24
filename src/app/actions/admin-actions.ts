"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { isAdmin } from "@/lib/auth";
import {
  normalizeDatetimeLocal,
  parseMultipleImageUploads,
  resolveImageList,
  serializeImageUrls,
} from "@/lib/media-upload";
import { getSession } from "@/lib/session";
import { saveMessageImage } from "@/lib/message-image";
import {
  createCommunity as addCommunity,
  createContactLink as addContactLink,
  createGiveaway as addGiveaway,
  createMeetGreetEvent as addMeetGreetEvent,
  deleteCommunity as removeCommunity,
  deleteContactLink as removeContactLink,
  deleteGiveaway as removeGiveaway,
  deleteMeetGreetEvent as removeMeetGreetEvent,
  getGiveawayById,
  getMeetGreetEventById,
  notifyAllFansAbout,
  approveMembershipApplication,
  rejectMembershipApplication,
  updateCommunity as saveCommunity,
  updateContactLink as saveContactLink,
  updateGiveaway as saveGiveaway,
  updateMeetGreetEvent as saveMeetGreetEvent,
  updateSiteSettings as saveSiteSettings,
  updateSiteButton as saveSiteButton,
  sendAdminMessage,
  updateUserRole,
  updateUserMembership,
  deleteUser,
  replyAsAdminToThread,
  markThreadReadByAdmin,
} from "@/lib/repository";
import type { UserRole } from "@/types/database";
import type { MembershipTier } from "@/types/membership";

async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
}

function scheduleFanNotification(input: {
  title: string;
  message: string;
  inboxSubject: string;
  inboxBody: string;
  linkPath: string;
}) {
  after(async () => {
    try {
      await notifyAllFansAbout(input);
      revalidatePath("/dashboard/notifications");
      revalidatePath("/dashboard/messages");
    } catch (error) {
      console.error("[notify] fan notification failed", error);
    }
  });
}

export async function updateUserRoleAction(targetUserId: string, formData: FormData) {
  try {
    await requireAdmin();

    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const role = formData.get("role") as UserRole;
    if (role !== "fan" && role !== "admin") {
      throw new Error("Invalid role.");
    }

    await updateUserRole(session.sub, targetUserId, role);
    revalidatePath("/admin/users");
    revalidatePath("/dashboard", "layout");
    redirect("/admin/users?updated=role");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "Could not update role.";
    redirect(`/admin/users?error=${encodeURIComponent(message)}`);
  }
}

export async function updateUserMembershipAction(targetUserId: string, formData: FormData) {
  try {
    await requireAdmin();

    const tier = formData.get("membership_tier") as MembershipTier;
    if (tier !== "none" && tier !== "silver" && tier !== "gold" && tier !== "platinum") {
      throw new Error("Invalid membership tier.");
    }

    await updateUserMembership(targetUserId, tier);
    revalidatePath("/admin/users");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/messages");
    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard/membership");
    redirect("/admin/users?updated=membership");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "Could not update membership.";
    redirect(`/admin/users?error=${encodeURIComponent(message)}`);
  }
}

export async function deleteUserAction(targetUserId: string) {
  try {
    await requireAdmin();

    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    await deleteUser(session.sub, targetUserId);
    revalidatePath("/admin/users");
    revalidatePath("/admin/messages");
    revalidatePath("/dashboard", "layout");
    redirect("/admin/users?updated=deleted");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "Could not delete account.";
    redirect(`/admin/users?error=${encodeURIComponent(message)}`);
  }
}

export async function sendAdminMessageAction(formData: FormData) {
  await requireAdmin();

  const recipient = (formData.get("recipient") as string)?.trim();
  const subject = (formData.get("subject") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const fromName = (formData.get("from_name") as string)?.trim() || "Keanu Fan Team";
  const alsoNotify = formData.get("also_notify") === "on";

  if (!recipient) throw new Error("Choose who should receive this message.");

  await sendAdminMessage({
    recipient: recipient === "all" ? "all" : recipient,
    subject,
    body,
    fromName,
    alsoNotify,
  });

  revalidatePath("/admin/messages");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard/notifications");
  redirect("/admin/messages?sent=1");
}

export async function replyAsAdminThreadAction(threadId: string, formData: FormData) {
  await requireAdmin();

  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const body = (formData.get("body") as string)?.trim();
  const fromName = (formData.get("from_name") as string)?.trim() || "Keanu Fan Team";
  let imageUrl: string | null = null;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    imageUrl = await saveMessageImage(session.sub, image);
  }

  await replyAsAdminToThread({ threadId, body, fromName, imageUrl });
  await markThreadReadByAdmin(threadId);

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${threadId}`);
  revalidatePath("/dashboard/messages");
  redirect(`/admin/messages/${threadId}?sent=1`);
}

export async function markAdminThreadReadAction(threadId: string) {
  await requireAdmin();
  await markThreadReadByAdmin(threadId);
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${threadId}`);
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requireAdmin();
  await saveSiteSettings({
    celebrity_name: formData.get("celebrity_name") as string,
    tagline: formData.get("tagline") as string,
    hero_video_url: formData.get("hero_video_url") as string,
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function createGiveawayAction(formData: FormData) {
  try {
    await requireAdmin();

    const id = randomUUID();
    const imageUrls = await parseMultipleImageUploads("giveaways", formData);
    const title = (formData.get("title") as string)?.trim();
    const status = formData.get("status") as "draft" | "active" | "closed";
    const endsAt = normalizeDatetimeLocal(formData.get("ends_at") as string);

    if (!title) throw new Error("Title is required.");

    await addGiveaway({
      id,
      title,
      description: (formData.get("description") as string) || null,
      rules: (formData.get("rules") as string) || null,
      image_url: imageUrls[0] ?? null,
      image_urls: serializeImageUrls(imageUrls),
      ends_at: endsAt,
      status,
    });

    if (status === "active") {
      scheduleFanNotification({
        title: "New giveaway is live",
        message: `"${title}" is now open for entries.`,
        inboxSubject: `Giveaway open: ${title}`,
        inboxBody: `A new giveaway has opened. Sign in to enter before it ends.`,
        linkPath: `/giveaways/${id}`,
      });
    }

    revalidatePath("/admin/giveaways");
    revalidatePath("/giveaways");
    redirect("/admin/giveaways?created=1");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "Could not create giveaway.";
    redirect(`/admin/giveaways?error=${encodeURIComponent(message)}`);
  }
}

export async function updateGiveawayAction(id: string, formData: FormData) {
  try {
    await requireAdmin();

    const existing = await getGiveawayById(id);
    if (!existing) throw new Error("Giveaway not found.");

    const existingUrls = resolveImageList(existing);
    const imageUrls = await parseMultipleImageUploads("giveaways", formData, "images", existingUrls);
    const title = (formData.get("title") as string)?.trim();
    const status = formData.get("status") as "draft" | "active" | "closed";
    const wasActive = existing.status === "active";
    const endsAt = normalizeDatetimeLocal(formData.get("ends_at") as string);

    if (!title) throw new Error("Title is required.");

    await saveGiveaway(id, {
      title,
      description: (formData.get("description") as string) || null,
      rules: (formData.get("rules") as string) || null,
      image_url: imageUrls[0] ?? null,
      image_urls: serializeImageUrls(imageUrls),
      ends_at: endsAt,
      status,
    });

    if (status === "active" && !wasActive) {
      scheduleFanNotification({
        title: "New giveaway is live",
        message: `"${title}" is now open for entries.`,
        inboxSubject: `Giveaway open: ${title}`,
        inboxBody: `A new giveaway has opened. Sign in to enter before it ends.`,
        linkPath: `/giveaways/${id}`,
      });
    }

    revalidatePath("/admin/giveaways");
    revalidatePath("/giveaways");
    revalidatePath(`/giveaways/${id}`);
    redirect("/admin/giveaways?updated=1");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "Could not update giveaway.";
    redirect(`/admin/giveaways?error=${encodeURIComponent(message)}`);
  }
}

export async function deleteGiveawayForm(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await removeGiveaway(id);
  revalidatePath("/admin/giveaways");
  revalidatePath("/giveaways");
}

export async function createMeetGreetEventAction(formData: FormData) {
  try {
    await requireAdmin();
    const title = (formData.get("title") as string)?.trim();
    const status = formData.get("status") as "upcoming" | "closed";
    const imageUrls = await parseMultipleImageUploads("meet-greet", formData);
    const eventDate = normalizeDatetimeLocal(formData.get("event_date") as string);

    if (!title) throw new Error("Title is required.");

    const id = await addMeetGreetEvent({
      title,
      description: (formData.get("description") as string) || null,
      location: (formData.get("location") as string) || null,
      image_url: imageUrls[0] ?? null,
      image_urls: serializeImageUrls(imageUrls),
      event_date: eventDate,
      max_spots: parseInt(formData.get("max_spots") as string, 10),
      status,
    });

    if (status === "upcoming") {
      scheduleFanNotification({
        title: "Meet & Greet requests open",
        message: `"${title}" is now accepting requests.`,
        inboxSubject: `Meet & Greet open: ${title}`,
        inboxBody: `A new meet and greet event is open for requests. Sign in to reserve your spot.`,
        linkPath: `/meet-and-greet/${id}`,
      });
    }

    revalidatePath("/admin/meet-and-greet");
    revalidatePath("/meet-and-greet");
    redirect("/admin/meet-and-greet?created=1");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "Could not create event.";
    redirect(`/admin/meet-and-greet?error=${encodeURIComponent(message)}`);
  }
}

export async function updateMeetGreetEventAction(id: string, formData: FormData) {
  try {
    await requireAdmin();
    const existing = await getMeetGreetEventById(id);
    if (!existing) throw new Error("Event not found.");

    const existingUrls = resolveImageList(existing);
    const imageUrls = await parseMultipleImageUploads(
      "meet-greet",
      formData,
      "images",
      existingUrls
    );
    const title = (formData.get("title") as string)?.trim();
    const status = formData.get("status") as "upcoming" | "closed";
    const wasUpcoming = existing.status === "upcoming";
    const eventDate = normalizeDatetimeLocal(formData.get("event_date") as string);

    if (!title) throw new Error("Title is required.");

    await saveMeetGreetEvent(id, {
      title,
      description: (formData.get("description") as string) || null,
      location: (formData.get("location") as string) || null,
      image_url: imageUrls[0] ?? null,
      image_urls: serializeImageUrls(imageUrls),
      event_date: eventDate,
      max_spots: parseInt(formData.get("max_spots") as string, 10),
      status,
    });

    if (status === "upcoming" && !wasUpcoming) {
      scheduleFanNotification({
        title: "Meet & Greet requests open",
        message: `"${title}" is now accepting requests.`,
        inboxSubject: `Meet & Greet open: ${title}`,
        inboxBody: `A meet and greet event is now open for requests. Sign in to reserve your spot.`,
        linkPath: `/meet-and-greet/${id}`,
      });
    }

    revalidatePath("/admin/meet-and-greet");
    revalidatePath("/meet-and-greet");
    revalidatePath(`/meet-and-greet/${id}`);
    redirect("/admin/meet-and-greet?updated=1");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "Could not update event.";
    redirect(`/admin/meet-and-greet?error=${encodeURIComponent(message)}`);
  }
}

export async function deleteMeetGreetEventForm(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await removeMeetGreetEvent(id);
  revalidatePath("/admin/meet-and-greet");
  revalidatePath("/meet-and-greet");
}

export async function createCommunityAction(formData: FormData) {
  await requireAdmin();
  await addCommunity({
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || "",
    platform: formData.get("platform") as string,
    url: formData.get("url") as string,
    is_active: formData.get("is_active") === "true",
    sort_order: parseInt(formData.get("sort_order") as string, 10) || 0,
  });
  revalidatePath("/admin/communities");
  revalidatePath("/communities");
}

export async function updateCommunityAction(id: string, formData: FormData) {
  await requireAdmin();
  await saveCommunity(id, {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || "",
    platform: formData.get("platform") as string,
    url: formData.get("url") as string,
    is_active: formData.get("is_active") === "true",
    sort_order: parseInt(formData.get("sort_order") as string, 10) || 0,
  });
  revalidatePath("/admin/communities");
  revalidatePath("/communities");
}

export async function deleteCommunityForm(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await removeCommunity(id);
  revalidatePath("/admin/communities");
  revalidatePath("/communities");
}

export async function createContactLinkAction(formData: FormData) {
  await requireAdmin();
  await addContactLink({
    platform: formData.get("platform") as string,
    recipient: formData.get("recipient") as string,
    label: formData.get("label") as string,
    url: formData.get("url") as string,
    is_active: formData.get("is_active") === "true",
    sort_order: parseInt(formData.get("sort_order") as string, 10) || 0,
  });
  revalidatePath("/admin/contact-links");
  revalidatePath("/contact");
  revalidatePath("/dashboard/contact");
}

export async function updateContactLinkAction(id: string, formData: FormData) {
  await requireAdmin();
  await saveContactLink(id, {
    platform: formData.get("platform") as string,
    recipient: formData.get("recipient") as string,
    label: formData.get("label") as string,
    url: formData.get("url") as string,
    is_active: formData.get("is_active") === "true",
    sort_order: parseInt(formData.get("sort_order") as string, 10) || 0,
  });
  revalidatePath("/admin/contact-links");
  revalidatePath("/contact");
  revalidatePath("/dashboard/contact");
}

export async function deleteContactLinkForm(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await removeContactLink(id);
  revalidatePath("/admin/contact-links");
  revalidatePath("/contact");
  revalidatePath("/dashboard/contact");
}

export async function updateSiteButtonAction(id: string, formData: FormData) {
  await requireAdmin();
  await saveSiteButton(id, {
    label: (formData.get("label") as string).trim(),
    href: (formData.get("href") as string).trim(),
    is_active: formData.get("is_active") === "true",
    open_in_new_tab: formData.get("open_in_new_tab") === "true",
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/site-buttons");
}

export async function approveMembershipApplicationAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await approveMembershipApplication(id);
  revalidatePath("/admin/memberships");
  revalidatePath("/dashboard/membership");
  revalidatePath("/dashboard");
}

export async function rejectMembershipApplicationAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await rejectMembershipApplication(id);
  revalidatePath("/admin/memberships");
  revalidatePath("/dashboard/membership");
  revalidatePath("/dashboard");
}

// Keep old names as aliases for admin pages
export const updateSiteSettings = updateSiteSettingsAction;
export const createGiveaway = createGiveawayAction;
export const updateGiveaway = updateGiveawayAction;
export const createMeetGreetEvent = createMeetGreetEventAction;
export const updateMeetGreetEvent = updateMeetGreetEventAction;
export const createCommunity = createCommunityAction;
export const updateCommunity = updateCommunityAction;
export const createContactLink = createContactLinkAction;
export const updateContactLink = updateContactLinkAction;
export const updateSiteButton = updateSiteButtonAction;
