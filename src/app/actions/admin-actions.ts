"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { isAdmin } from "@/lib/auth";
import { parseGiveawayImageUpload } from "@/lib/giveaway-image";
import { getSession } from "@/lib/session";
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

  const body = (formData.get("body") as string)?.trim();
  const fromName = (formData.get("from_name") as string)?.trim() || "Keanu Fan Team";

  await replyAsAdminToThread({ threadId, body, fromName });
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
  await requireAdmin();

  const id = randomUUID();
  const imageUrl = await parseGiveawayImageUpload(id, formData);
  const title = formData.get("title") as string;
  const status = formData.get("status") as "draft" | "active" | "closed";

  await addGiveaway({
    id,
    title,
    description: (formData.get("description") as string) || null,
    rules: (formData.get("rules") as string) || null,
    image_url: imageUrl,
    ends_at: formData.get("ends_at") as string,
    status,
  });

  if (status === "active") {
    await notifyAllFansAbout({
      title: "New giveaway is live",
      message: `"${title}" is now open for entries.`,
      inboxSubject: `Giveaway open: ${title}`,
      inboxBody: `A new giveaway has opened. Sign in to enter before it ends.`,
      linkPath: `/giveaways/${id}`,
    });
    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard/messages");
  }

  revalidatePath("/admin/giveaways");
  revalidatePath("/giveaways");
}

export async function updateGiveawayAction(id: string, formData: FormData) {
  await requireAdmin();

  const existing = await getGiveawayById(id);
  const imageUrl = await parseGiveawayImageUpload(id, formData, existing?.image_url ?? null);
  const title = formData.get("title") as string;
  const status = formData.get("status") as "draft" | "active" | "closed";
  const wasActive = existing?.status === "active";

  await saveGiveaway(id, {
    title,
    description: (formData.get("description") as string) || null,
    rules: (formData.get("rules") as string) || null,
    image_url: imageUrl,
    ends_at: formData.get("ends_at") as string,
    status,
  });

  if (status === "active" && !wasActive) {
    await notifyAllFansAbout({
      title: "New giveaway is live",
      message: `"${title}" is now open for entries.`,
      inboxSubject: `Giveaway open: ${title}`,
      inboxBody: `A new giveaway has opened. Sign in to enter before it ends.`,
      linkPath: `/giveaways/${id}`,
    });
    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard/messages");
  }

  revalidatePath("/admin/giveaways");
  revalidatePath("/giveaways");
  revalidatePath(`/giveaways/${id}`);
}

export async function deleteGiveawayForm(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await removeGiveaway(id);
  revalidatePath("/admin/giveaways");
  revalidatePath("/giveaways");
}

export async function createMeetGreetEventAction(formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  const status = formData.get("status") as "upcoming" | "closed";

  await addMeetGreetEvent({
    title,
    description: (formData.get("description") as string) || null,
    location: (formData.get("location") as string) || null,
    event_date: formData.get("event_date") as string,
    max_spots: parseInt(formData.get("max_spots") as string, 10),
    status,
  });

  if (status === "upcoming") {
    await notifyAllFansAbout({
      title: "Meet & Greet requests open",
      message: `"${title}" is now accepting requests.`,
      inboxSubject: `Meet & Greet open: ${title}`,
      inboxBody: `A new meet and greet event is open for requests. Sign in to reserve your spot.`,
      linkPath: "/dashboard/meet-and-greet",
    });
    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard/messages");
  }

  revalidatePath("/admin/meet-and-greet");
  revalidatePath("/meet-and-greet");
}

export async function updateMeetGreetEventAction(id: string, formData: FormData) {
  await requireAdmin();
  const existing = await getMeetGreetEventById(id);
  const title = formData.get("title") as string;
  const status = formData.get("status") as "upcoming" | "closed";
  const wasUpcoming = existing?.status === "upcoming";

  await saveMeetGreetEvent(id, {
    title,
    description: (formData.get("description") as string) || null,
    location: (formData.get("location") as string) || null,
    event_date: formData.get("event_date") as string,
    max_spots: parseInt(formData.get("max_spots") as string, 10),
    status,
  });

  if (status === "upcoming" && !wasUpcoming) {
    await notifyAllFansAbout({
      title: "Meet & Greet requests open",
      message: `"${title}" is now accepting requests.`,
      inboxSubject: `Meet & Greet open: ${title}`,
      inboxBody: `A meet and greet event is now open for requests. Sign in to reserve your spot.`,
      linkPath: "/dashboard/meet-and-greet",
    });
    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard/messages");
  }

  revalidatePath("/admin/meet-and-greet");
  revalidatePath("/meet-and-greet");
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
