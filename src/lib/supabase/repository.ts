import { cache } from "react";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import type {
  Community,
  ContactLink,
  Giveaway,
  GiveawayEntry,
  MeetGreetEvent,
  MeetGreetRegistration,
  Profile,
  SiteButton,
  SiteSettings,
  UserRole,
} from "@/types/database";
import type { Message, Notification } from "@/types/messages";
import type { MembershipApplication, MembershipApplicationStatus } from "@/types/membership";
import { normalizeContactUrl } from "@/lib/contact-dms";
import {
  getMembershipPrice,
  normalizeMembershipStatus,
  normalizeMembershipTier,
} from "@/lib/membership";
import { getSupabaseAdmin } from "@/lib/supabase/client";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  role: UserRole;
  country?: string | null;
  avatar_url?: string | null;
  membership_tier?: string | null;
  membership_status?: string | null;
  created_at: string;
}

interface MembershipApplicationRow {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  tier: string;
  amount: number;
  status: MembershipApplicationStatus;
  created_at: string;
  reviewed_at?: string | null;
}

interface MessageRow {
  id: string;
  user_id: string;
  subject: string;
  body: string;
  from_name: string;
  is_read: boolean | string;
  status?: string;
  created_at: string;
}

interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean | string;
  created_at: string;
}

interface CommunityRow {
  id: string;
  name: string;
  description: string | null;
  platform: string;
  url: string;
  is_active: boolean | string;
  sort_order: number;
  created_at: string;
}

interface ContactLinkRow {
  id: string;
  platform: string;
  recipient?: string;
  label: string;
  url: string;
  is_active: boolean | string;
  sort_order: number;
  created_at: string;
}

function now() {
  return new Date().toISOString();
}

function parseBool(value: boolean | string | number | null | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return (
      normalized === "true" ||
      normalized === "1" ||
      normalized === "yes" ||
      normalized === "y" ||
      normalized === "on"
    );
  }
  return false;
}

function writeErrorMessage() {
  return "Could not save.";
}

function throwReadError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

function throwWriteError(error: { message: string } | null): void {
  if (error) throw new Error(writeErrorMessage());
}

function userToProfile(row: UserRow): Profile {
  return {
    id: row.id,
    display_name: row.display_name,
    role: row.role,
    country: row.country ?? null,
    avatar_url: row.avatar_url ?? null,
    membership_tier: normalizeMembershipTier(row.membership_tier),
    membership_status: normalizeMembershipStatus(row.membership_status),
    created_at: row.created_at,
  };
}

function normalizeMessageStatus(row: MessageRow): Message["status"] {
  const status = row.status?.toLowerCase();
  if (status === "unread" || status === "read" || status === "replied") {
    return status;
  }
  return parseBool(row.is_read) ? "read" : "unread";
}

function mapMessage(row: MessageRow): Message {
  const status = normalizeMessageStatus(row);
  return {
    ...row,
    is_read: status !== "unread",
    status,
  };
}

function toCommunity(row: CommunityRow): Community {
  return {
    ...row,
    is_active: parseBool(row.is_active),
    sort_order: Number(row.sort_order) || 0,
  };
}

function toContactLink(row: ContactLinkRow): ContactLink {
  return {
    ...row,
    recipient: row.recipient === "team" ? "team" : "keanu",
    url: normalizeContactUrl(row.url, row.platform),
    is_active: parseBool(row.is_active),
    sort_order: Number(row.sort_order) || 0,
  };
}

function toMembershipApplication(row: MembershipApplicationRow): MembershipApplication {
  return {
    ...row,
    amount: Number(row.amount) || 0,
    tier: row.tier as MembershipApplication["tier"],
    reviewed_at: row.reviewed_at ?? null,
  };
}

export function isDatabaseReady(): boolean {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean(url && key);
}

export const isExcelBackendReady = isDatabaseReady;

// ─── Users / Auth ───────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("app_users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle<UserRow>();
  throwReadError(error);
  return data ?? null;
}

async function findUserByIdUncached(id: string): Promise<UserRow | null> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("app_users")
    .select("*")
    .eq("id", id)
    .maybeSingle<UserRow>();
  throwReadError(error);
  return data ?? null;
}

export const findUserById = cache(findUserByIdUncached);

export async function createUser(
  email: string,
  password: string,
  displayName: string,
  country?: string | null
): Promise<UserRow> {
  const client = getSupabaseAdmin();
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 8);
  const user: UserRow = {
    id: randomUUID(),
    email: email.toLowerCase(),
    password_hash: passwordHash,
    display_name: displayName,
    role: "fan",
    country: country?.trim() || null,
    membership_tier: "none",
    membership_status: "none",
    created_at: now(),
  };

  const { error: userInsertError } = await client.from("app_users").insert(user);
  throwWriteError(userInsertError);

  const firstName = displayName.trim().split(/\s+/)[0] || "Fan";
  const timestamp = now();
  const welcomeBody = [
    `Hi ${firstName},`,
    "",
    "Welcome to the official Keanu Reeves fan community! Your account is now active.",
    "",
    "Apply for Silver, Gold, or Platinum membership from Dashboard → Membership to unlock giveaways, meet & greets, and private messaging.",
    "",
    "We're glad you're here. Explore the site and make yourself at home.",
    "",
    "— Keanu Fan Team",
  ].join("\n");

  const { error: messageError } = await client.from("messages").insert({
    id: randomUUID(),
    user_id: user.id,
    subject: "Welcome to the fan community",
    body: welcomeBody,
    from_name: "Keanu Fan Team",
    is_read: false,
    status: "unread",
    created_at: timestamp,
  });
  throwWriteError(messageError);

  const { error: notificationError } = await client.from("notifications").insert({
    id: randomUUID(),
    user_id: user.id,
    title: `Welcome, ${firstName}!`,
    message: "Your member account is ready. Check your inbox for a welcome message.",
    is_read: false,
    created_at: timestamp,
  });
  throwWriteError(notificationError);

  return user;
}

export async function verifyPassword(user: UserRow, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password_hash);
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const user = await findUserById(id);
  return user ? userToProfile(user) : null;
}

export async function updateUserDisplayName(id: string, displayName: string) {
  await updateUserProfile(id, { displayName });
}

export async function updateUserProfile(
  id: string,
  data: { displayName: string; country?: string | null; avatarUrl?: string | null }
) {
  const existing = await findUserById(id);
  if (!existing) throw new Error("User not found.");

  const updates: Record<string, string | null> = {
    display_name: data.displayName.trim(),
    country: data.country?.trim() || null,
  };
  if (data.avatarUrl !== undefined) {
    updates.avatar_url = data.avatarUrl;
  }

  const client = getSupabaseAdmin();
  const { error } = await client.from("app_users").update(updates).eq("id", id);
  throwWriteError(error);
}

export async function updateUserAvatar(id: string, avatarUrl: string | null) {
  const existing = await findUserById(id);
  if (!existing) throw new Error("User not found.");

  const client = getSupabaseAdmin();
  const { error } = await client.from("app_users").update({ avatar_url: avatarUrl }).eq("id", id);
  throwWriteError(error);
}

export interface AdminUserSummary {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  country: string | null;
  created_at: string;
  membership_tier: import("@/types/membership").MembershipTier;
  membership_status: import("@/types/membership").MembershipStatus;
}

export async function getAdminUserList(): Promise<AdminUserSummary[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("app_users")
    .select("id, email, display_name, role, country, created_at, membership_tier, membership_status");
  throwReadError(error);
  return ((data ?? []) as (AdminUserSummary & {
    membership_tier?: string | null;
    membership_status?: string | null;
  })[])
    .map((row) => ({
      ...row,
      membership_tier: normalizeMembershipTier(row.membership_tier),
      membership_status: normalizeMembershipStatus(row.membership_status),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function countAdmins(): Promise<number> {
  const client = getSupabaseAdmin();
  const { count, error } = await client
    .from("app_users")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  throwReadError(error);
  return count ?? 0;
}

export async function updateUserRole(
  actorId: string,
  targetUserId: string,
  role: UserRole
): Promise<void> {
  if (role !== "fan" && role !== "admin") {
    throw new Error("Invalid role.");
  }

  const client = getSupabaseAdmin();
  const { data: users, error } = await client.from("app_users").select("id, role");
  throwReadError(error);

  const rows = (users ?? []) as { id: string; role: UserRole }[];
  const target = rows.find((row) => row.id === targetUserId);
  if (!target) throw new Error("User not found.");
  if (target.role === role) return;

  const adminCount = rows.filter((row) => row.role === "admin").length;
  if (target.role === "admin" && role === "fan") {
    if (adminCount <= 1) {
      throw new Error("Cannot remove the last admin. Promote another admin first.");
    }
    if (targetUserId === actorId) {
      throw new Error("You cannot remove your own admin access. Ask another admin to change your role.");
    }
  }

  const updatePayload =
    role === "admin"
      ? { role, membership_tier: "platinum", membership_status: "active" }
      : { role };

  const { error: updateError } = await client
    .from("app_users")
    .update(updatePayload)
    .eq("id", targetUserId);
  throwWriteError(updateError);
}

export async function updateUserMembership(
  targetUserId: string,
  tier: import("@/types/membership").MembershipTier
): Promise<void> {
  if (tier !== "none" && tier !== "silver" && tier !== "gold" && tier !== "platinum") {
    throw new Error("Invalid membership tier.");
  }

  const client = getSupabaseAdmin();
  const { data: target, error: targetError } = await client
    .from("app_users")
    .select("id, role")
    .eq("id", targetUserId)
    .maybeSingle<{ id: string; role: UserRole }>();
  throwReadError(targetError);
  if (!target) throw new Error("User not found.");
  if (target.role === "admin") {
    throw new Error("Admins always have Platinum membership.");
  }

  const { error: updateError } = await client
    .from("app_users")
    .update({
      membership_tier: tier,
      membership_status: tier === "none" ? "none" : "active",
    })
    .eq("id", targetUserId);
  throwWriteError(updateError);
}

// ─── Membership ───────────────────────────────────────────────

export async function getLatestMembershipApplicationForUser(
  userId: string
): Promise<MembershipApplication | null> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("membership_applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<MembershipApplicationRow>();
  throwReadError(error);
  return data ? toMembershipApplication(data) : null;
}

export async function getAllMembershipApplications(): Promise<MembershipApplication[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client.from("membership_applications").select("*");
  throwReadError(error);

  return ((data ?? []) as MembershipApplicationRow[]).map(toMembershipApplication).sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (b.status === "pending" && a.status !== "pending") return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function createMembershipApplication(
  userId: string,
  tier: MembershipApplication["tier"]
) {
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found.");

  const client = getSupabaseAdmin();
  const { data: pendingRows, error: pendingError } = await client
    .from("membership_applications")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "pending")
    .limit(1);
  throwReadError(pendingError);
  if ((pendingRows ?? []).length > 0) {
    throw new Error("You already have a membership application under review.");
  }

  const currentTier = normalizeMembershipTier(user.membership_tier);
  const currentStatus = normalizeMembershipStatus(user.membership_status);
  const tierRank = { none: 0, silver: 1, gold: 2, platinum: 3 };
  if (currentStatus === "active" && tierRank[currentTier] >= tierRank[tier]) {
    throw new Error("You already have this membership level or higher.");
  }

  const timestamp = now();
  const application: MembershipApplicationRow = {
    id: randomUUID(),
    user_id: userId,
    user_email: user.email,
    user_name: user.display_name,
    tier,
    amount: getMembershipPrice(tier),
    status: "pending",
    created_at: timestamp,
    reviewed_at: null,
  };

  const { error: insertError } = await client.from("membership_applications").insert(application);
  throwWriteError(insertError);

  const { error: userError } = await client
    .from("app_users")
    .update({ membership_status: "pending" })
    .eq("id", userId);
  throwWriteError(userError);
}

async function notifyMembershipDecision(
  userId: string,
  subject: string,
  body: string,
  notificationTitle: string,
  notificationMessage: string
) {
  const client = getSupabaseAdmin();
  const timestamp = now();

  const { error: messageError } = await client.from("messages").insert({
    id: randomUUID(),
    user_id: userId,
    subject,
    body,
    from_name: "Keanu Fan Team",
    is_read: false,
    status: "unread",
    created_at: timestamp,
  });
  throwWriteError(messageError);

  const { error: notificationError } = await client.from("notifications").insert({
    id: randomUUID(),
    user_id: userId,
    title: notificationTitle,
    message: notificationMessage,
    is_read: false,
    created_at: timestamp,
  });
  throwWriteError(notificationError);
}

export async function approveMembershipApplication(applicationId: string) {
  const client = getSupabaseAdmin();
  const { data: application, error } = await client
    .from("membership_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle<MembershipApplicationRow>();
  throwReadError(error);
  if (!application) throw new Error("Application not found.");
  if (application.status !== "pending") {
    throw new Error("This application has already been reviewed.");
  }

  const { data: user, error: userError } = await client
    .from("app_users")
    .select("id")
    .eq("id", application.user_id)
    .maybeSingle<{ id: string }>();
  throwReadError(userError);
  if (!user) throw new Error("Applicant not found.");

  const timestamp = now();
  const { error: updateApplicationError } = await client
    .from("membership_applications")
    .update({ status: "approved", reviewed_at: timestamp })
    .eq("id", applicationId);
  throwWriteError(updateApplicationError);

  const { error: updateUserError } = await client
    .from("app_users")
    .update({
      membership_tier: application.tier,
      membership_status: "active",
    })
    .eq("id", application.user_id);
  throwWriteError(updateUserError);

  const planName =
    application.tier === "silver"
      ? "Silver Member"
      : application.tier === "gold"
        ? "Gold Member"
        : "Platinum Member";

  await notifyMembershipDecision(
    application.user_id,
    `Membership approved: ${planName}`,
    `Your ${planName} application has been approved. Welcome to the official fan experience.\n\nAmount: $${application.amount}\n\nOpen your dashboard to explore your member benefits.`,
    "Membership approved",
    `You're now a ${planName}.`
  );
}

export async function rejectMembershipApplication(applicationId: string) {
  const client = getSupabaseAdmin();
  const { data: application, error } = await client
    .from("membership_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle<MembershipApplicationRow>();
  throwReadError(error);
  if (!application) throw new Error("Application not found.");
  if (application.status !== "pending") {
    throw new Error("This application has already been reviewed.");
  }

  const { data: user, error: userError } = await client
    .from("app_users")
    .select("id, membership_tier, membership_status")
    .eq("id", application.user_id)
    .maybeSingle<Pick<UserRow, "id" | "membership_tier" | "membership_status">>();
  throwReadError(userError);
  if (!user) throw new Error("Applicant not found.");

  const timestamp = now();
  const { error: applicationUpdateError } = await client
    .from("membership_applications")
    .update({ status: "rejected", reviewed_at: timestamp })
    .eq("id", applicationId);
  throwWriteError(applicationUpdateError);

  const stillActive =
    normalizeMembershipStatus(user.membership_status) === "active" &&
    normalizeMembershipTier(user.membership_tier) !== "none";

  if (!stillActive) {
    const { error: updateUserError } = await client
      .from("app_users")
      .update({ membership_status: "none" })
      .eq("id", application.user_id);
    throwWriteError(updateUserError);
  }

  await notifyMembershipDecision(
    application.user_id,
    "Membership application update",
    "Thanks for your interest. Your latest membership application was not approved at this time. You can apply again from your dashboard when you're ready.",
    "Membership application update",
    "Your membership application was not approved."
  );
}

// ─── Site Settings ────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const client = getSupabaseAdmin();
  const { data, error } = await client.from("site_settings").select("*").eq("id", 1).maybeSingle();
  throwReadError(error);
  return (data as SiteSettings | null) ?? null;
}

export async function updateSiteSettings(data: {
  celebrity_name: string;
  tagline: string;
  hero_video_url: string;
}) {
  const client = getSupabaseAdmin();
  const { error } = await client.from("site_settings").upsert(
    {
      id: 1,
      celebrity_name: data.celebrity_name,
      tagline: data.tagline,
      hero_video_url: data.hero_video_url,
      updated_at: now(),
    },
    { onConflict: "id" }
  );
  throwWriteError(error);
}

// ─── Giveaways ────────────────────────────────────────────────

export async function getGiveaways(): Promise<Giveaway[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client.from("giveaways").select("*").in("status", ["active", "closed"]);
  throwReadError(error);
  return ((data ?? []) as Giveaway[]).sort(
    (a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime()
  );
}

export async function getAllGiveaways(): Promise<Giveaway[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client.from("giveaways").select("*");
  throwReadError(error);
  return ((data ?? []) as Giveaway[]).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getActiveGiveaways(): Promise<Giveaway[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client.from("giveaways").select("*").eq("status", "active");
  throwReadError(error);
  const timestamp = Date.now();
  return ((data ?? []) as Giveaway[])
    .filter((g) => new Date(g.ends_at).getTime() > timestamp)
    .sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime());
}

export async function getGiveawayEntryIdsForUser(userId: string): Promise<string[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("giveaway_entries")
    .select("giveaway_id")
    .eq("user_id", userId);
  throwReadError(error);
  return ((data ?? []) as { giveaway_id: string }[]).map((row) => row.giveaway_id);
}

export async function getGiveawayById(id: string): Promise<Giveaway | null> {
  const client = getSupabaseAdmin();
  const { data, error } = await client.from("giveaways").select("*").eq("id", id).maybeSingle<Giveaway>();
  throwReadError(error);
  return data ?? null;
}

export async function createGiveaway(data: Omit<Giveaway, "created_at"> & { id?: string }) {
  const client = getSupabaseAdmin();
  const id = data.id ?? randomUUID();
  const { error } = await client.from("giveaways").insert({
    ...data,
    id,
    created_at: now(),
  });
  throwWriteError(error);
  return id;
}

export async function updateGiveaway(id: string, data: Partial<Giveaway>) {
  const existing = await getGiveawayById(id);
  if (!existing) throw new Error("Giveaway not found.");

  const client = getSupabaseAdmin();
  const { error } = await client
    .from("giveaways")
    .update({ ...existing, ...data, id })
    .eq("id", id);
  throwWriteError(error);
}

export async function deleteGiveaway(id: string) {
  const client = getSupabaseAdmin();
  const { error } = await client.from("giveaways").delete().eq("id", id);
  throwWriteError(error);
}

// ─── Giveaway Entries ─────────────────────────────────────────

export async function getGiveawayEntriesForUser(userId: string) {
  const client = getSupabaseAdmin();
  const { data: entries, error: entriesError } = await client
    .from("giveaway_entries")
    .select("*")
    .eq("user_id", userId);
  throwReadError(entriesError);

  const { data: giveaways, error: giveawaysError } = await client.from("giveaways").select("*");
  throwReadError(giveawaysError);

  const byId = new Map((giveaways ?? []).map((g) => [g.id, g as Giveaway]));
  return ((entries ?? []) as GiveawayEntry[])
    .map((entry) => {
      const giveaway = byId.get(entry.giveaway_id);
      if (!giveaway) return null;
      return { entry, giveaway };
    })
    .filter((row): row is { entry: GiveawayEntry; giveaway: Giveaway } => row !== null)
    .sort(
      (a, b) => new Date(b.entry.created_at).getTime() - new Date(a.entry.created_at).getTime()
    );
}

export async function hasGiveawayEntry(userId: string, giveawayId: string): Promise<boolean> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("giveaway_entries")
    .select("id")
    .eq("user_id", userId)
    .eq("giveaway_id", giveawayId)
    .limit(1);
  throwReadError(error);
  return (data ?? []).length > 0;
}

export async function createGiveawayEntry(userId: string, giveawayId: string) {
  if (await hasGiveawayEntry(userId, giveawayId)) {
    throw new Error("You have already entered this giveaway.");
  }

  const client = getSupabaseAdmin();
  const { error } = await client.from("giveaway_entries").insert({
    id: randomUUID(),
    giveaway_id: giveawayId,
    user_id: userId,
    created_at: now(),
  });
  throwWriteError(error);
}

export async function countGiveawayEntries(): Promise<number> {
  const client = getSupabaseAdmin();
  const { count, error } = await client
    .from("giveaway_entries")
    .select("id", { count: "exact", head: true });
  throwReadError(error);
  return count ?? 0;
}

// ─── Meet & Greet ─────────────────────────────────────────────

export async function getMeetGreetEvents(): Promise<MeetGreetEvent[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("meet_greet_events")
    .select("*")
    .in("status", ["upcoming", "closed"]);
  throwReadError(error);
  return ((data ?? []) as MeetGreetEvent[]).sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );
}

export async function getAllMeetGreetEvents(): Promise<MeetGreetEvent[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client.from("meet_greet_events").select("*");
  throwReadError(error);
  return ((data ?? []) as MeetGreetEvent[]).sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );
}

export async function getMeetGreetEventById(id: string): Promise<MeetGreetEvent | null> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("meet_greet_events")
    .select("*")
    .eq("id", id)
    .maybeSingle<MeetGreetEvent>();
  throwReadError(error);
  return data ?? null;
}

export async function createMeetGreetEvent(data: Omit<MeetGreetEvent, "id" | "created_at">) {
  const client = getSupabaseAdmin();
  const { error } = await client.from("meet_greet_events").insert({
    ...data,
    id: randomUUID(),
    created_at: now(),
  });
  throwWriteError(error);
}

export async function updateMeetGreetEvent(id: string, data: Partial<MeetGreetEvent>) {
  const event = await getMeetGreetEventById(id);
  if (!event) throw new Error("Event not found.");

  const client = getSupabaseAdmin();
  const { error } = await client
    .from("meet_greet_events")
    .update({ ...event, ...data, id })
    .eq("id", id);
  throwWriteError(error);
}

export async function deleteMeetGreetEvent(id: string) {
  const client = getSupabaseAdmin();
  const { error } = await client.from("meet_greet_events").delete().eq("id", id);
  throwWriteError(error);
}

// ─── Registrations ────────────────────────────────────────────

export async function getRegistrationsForUser(userId: string) {
  const client = getSupabaseAdmin();
  const { data: registrations, error: registrationsError } = await client
    .from("meet_greet_registrations")
    .select("*")
    .eq("user_id", userId);
  throwReadError(registrationsError);

  const { data: events, error: eventsError } = await client.from("meet_greet_events").select("*");
  throwReadError(eventsError);

  const byId = new Map((events ?? []).map((event) => [event.id, event as MeetGreetEvent]));
  return ((registrations ?? []) as MeetGreetRegistration[])
    .map((registration) => {
      const event = byId.get(registration.event_id);
      if (!event) return null;
      return { registration, event };
    })
    .filter(
      (row): row is { registration: MeetGreetRegistration; event: MeetGreetEvent } => row !== null
    )
    .sort(
      (a, b) =>
        new Date(b.registration.created_at).getTime() -
        new Date(a.registration.created_at).getTime()
    );
}

export async function getRegistrationForUser(
  userId: string,
  eventId: string
): Promise<MeetGreetRegistration | null> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("meet_greet_registrations")
    .select("*")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .maybeSingle<MeetGreetRegistration>();
  throwReadError(error);
  return data ?? null;
}

export async function countConfirmedRegistrations(eventId: string): Promise<number> {
  const client = getSupabaseAdmin();
  const { count, error } = await client
    .from("meet_greet_registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "confirmed");
  throwReadError(error);
  return count ?? 0;
}

export async function createMeetGreetRegistration(userId: string, eventId: string) {
  const existing = await getRegistrationForUser(userId, eventId);
  if (existing) {
    throw new Error("You are already registered for this event.");
  }

  const event = await getMeetGreetEventById(eventId);
  if (!event) throw new Error("Event not found.");

  const confirmedCount = await countConfirmedRegistrations(eventId);
  const status = confirmedCount >= event.max_spots ? "waitlist" : "confirmed";

  const client = getSupabaseAdmin();
  const { error } = await client.from("meet_greet_registrations").insert({
    id: randomUUID(),
    event_id: eventId,
    user_id: userId,
    status,
    created_at: now(),
  });
  throwWriteError(error);
  return status;
}

// ─── Communities ──────────────────────────────────────────────

export async function getCommunities(): Promise<Community[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client.from("communities").select("*").eq("is_active", true);
  throwReadError(error);
  return ((data ?? []) as CommunityRow[])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toCommunity);
}

export async function getAllCommunities(): Promise<Community[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client.from("communities").select("*");
  throwReadError(error);
  return ((data ?? []) as CommunityRow[])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toCommunity);
}

export async function createCommunity(data: {
  name: string;
  description: string;
  platform: string;
  url: string;
  is_active: boolean;
  sort_order: number;
}) {
  const client = getSupabaseAdmin();
  const { error } = await client.from("communities").insert({
    id: randomUUID(),
    name: data.name,
    description: data.description,
    platform: data.platform,
    url: data.url,
    is_active: data.is_active,
    sort_order: data.sort_order,
    created_at: now(),
  });
  throwWriteError(error);
}

export async function updateCommunity(
  id: string,
  data: {
    name: string;
    description: string;
    platform: string;
    url: string;
    is_active: boolean;
    sort_order: number;
  }
) {
  const client = getSupabaseAdmin();
  const { data: existing, error: existingError } = await client
    .from("communities")
    .select("id")
    .eq("id", id)
    .maybeSingle<{ id: string }>();
  throwReadError(existingError);
  if (!existing) throw new Error("Community not found.");

  const { error } = await client.from("communities").update({ ...data, id }).eq("id", id);
  throwWriteError(error);
}

export async function deleteCommunity(id: string) {
  const client = getSupabaseAdmin();
  const { error } = await client.from("communities").delete().eq("id", id);
  throwWriteError(error);
}

// ─── Contact Links ────────────────────────────────────────────

export async function getContactLinks(): Promise<ContactLink[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client.from("contact_links").select("*").eq("is_active", true);
  throwReadError(error);
  return ((data ?? []) as ContactLinkRow[])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toContactLink);
}

export async function getAllContactLinks(): Promise<ContactLink[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client.from("contact_links").select("*");
  throwReadError(error);
  return ((data ?? []) as ContactLinkRow[])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toContactLink);
}

export async function createContactLink(data: {
  platform: string;
  recipient: string;
  label: string;
  url: string;
  is_active: boolean;
  sort_order: number;
}) {
  const client = getSupabaseAdmin();
  const { error } = await client.from("contact_links").insert({
    id: randomUUID(),
    platform: data.platform,
    recipient: data.recipient === "team" ? "team" : "keanu",
    label: data.label,
    url: normalizeContactUrl(data.url, data.platform),
    is_active: data.is_active,
    sort_order: data.sort_order,
    created_at: now(),
  });
  throwWriteError(error);
}

export async function updateContactLink(
  id: string,
  data: {
    platform: string;
    recipient: string;
    label: string;
    url: string;
    is_active: boolean;
    sort_order: number;
  }
) {
  const client = getSupabaseAdmin();
  const { data: existing, error: existingError } = await client
    .from("contact_links")
    .select("id")
    .eq("id", id)
    .maybeSingle<{ id: string }>();
  throwReadError(existingError);
  if (!existing) throw new Error("Contact link not found.");

  const { error } = await client
    .from("contact_links")
    .update({
      ...data,
      id,
      recipient: data.recipient === "team" ? "team" : "keanu",
      url: normalizeContactUrl(data.url, data.platform),
    })
    .eq("id", id);
  throwWriteError(error);
}

export async function deleteContactLink(id: string) {
  const client = getSupabaseAdmin();
  const { error } = await client.from("contact_links").delete().eq("id", id);
  throwWriteError(error);
}

// ─── Site buttons ───────────────────────────────────────────────

interface SiteButtonRow {
  id: string;
  button_key: string;
  section: string;
  label: string;
  href: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  open_in_new_tab: boolean;
  updated_at: string;
}

function toSiteButton(row: SiteButtonRow): SiteButton {
  return {
    id: row.id,
    button_key: row.button_key,
    section: row.section,
    label: row.label,
    href: row.href,
    description: row.description,
    is_active: row.is_active,
    sort_order: row.sort_order,
    open_in_new_tab: row.open_in_new_tab,
    updated_at: row.updated_at,
  };
}

export async function getAllSiteButtons(): Promise<SiteButton[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client.from("site_buttons").select("*");
  throwReadError(error);
  return ((data ?? []) as SiteButtonRow[])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toSiteButton);
}

export async function updateSiteButton(
  id: string,
  data: {
    label: string;
    href: string;
    is_active: boolean;
    open_in_new_tab: boolean;
  }
) {
  const client = getSupabaseAdmin();
  const { data: existing, error: existingError } = await client
    .from("site_buttons")
    .select("id")
    .eq("id", id)
    .maybeSingle<{ id: string }>();
  throwReadError(existingError);
  if (!existing) throw new Error("Site button not found.");

  const { error } = await client
    .from("site_buttons")
    .update({
      label: data.label,
      href: data.href,
      is_active: data.is_active,
      open_in_new_tab: data.open_in_new_tab,
      updated_at: now(),
    })
    .eq("id", id);
  throwWriteError(error);
}

// ─── Messaging / Notifications ─────────────────────────────────

export async function getMessagesForUser(userId: string): Promise<Message[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client.from("messages").select("*").eq("user_id", userId);
  throwReadError(error);
  return ((data ?? []) as MessageRow[])
    .map(mapMessage)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function countMessagesForUser(userId: string): Promise<number> {
  const client = getSupabaseAdmin();
  const { count, error } = await client
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  throwReadError(error);
  return count ?? 0;
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client.from("notifications").select("*").eq("user_id", userId);
  throwReadError(error);
  return ((data ?? []) as NotificationRow[])
    .map((row) => ({ ...row, is_read: parseBool(row.is_read) }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const client = getSupabaseAdmin();
  const { count, error } = await client
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  throwReadError(error);
  return count ?? 0;
}

export async function getFansForMessaging(): Promise<AdminUserSummary[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("app_users")
    .select("id, email, display_name, role, country, created_at, membership_tier, membership_status")
    .eq("role", "fan");
  throwReadError(error);
  return ((data ?? []) as (AdminUserSummary & {
    membership_tier?: string | null;
    membership_status?: string | null;
  })[])
    .map((row) => ({
      ...row,
      membership_tier: normalizeMembershipTier(row.membership_tier),
      membership_status: normalizeMembershipStatus(row.membership_status),
    }))
    .sort((a, b) => a.display_name.localeCompare(b.display_name));
}

export async function sendAdminMessage(input: {
  recipient: "all" | string;
  subject: string;
  body: string;
  fromName: string;
  alsoNotify: boolean;
}): Promise<{ sent: number }> {
  const subject = input.subject.trim();
  const body = input.body.trim();
  const fromName = input.fromName.trim() || "Keanu Fan Team";
  if (!subject || !body) {
    throw new Error("Subject and message are required.");
  }

  const client = getSupabaseAdmin();
  const userQuery =
    input.recipient === "all"
      ? client.from("app_users").select("id, email, role").eq("role", "fan")
      : client.from("app_users").select("id, email, role").eq("id", input.recipient);
  const { data: users, error: usersError } = await userQuery;
  throwReadError(usersError);

  const targets = (users ?? []).filter((u) => u.role === "fan") as {
    id: string;
    email: string;
    role: UserRole;
  }[];
  if (!targets.length) {
    throw new Error("No fans found for this recipient.");
  }

  const timestamp = now();
  const notifyPreview = body.split("\n").find((line) => line.trim())?.trim() ?? subject;
  const messages: MessageRow[] = targets.map((user) => ({
    id: randomUUID(),
    user_id: user.id,
    subject,
    body,
    from_name: fromName,
    is_read: false,
    status: "unread",
    created_at: timestamp,
  }));
  const notifications: NotificationRow[] = input.alsoNotify
    ? targets.map((user) => ({
        id: randomUUID(),
        user_id: user.id,
        title: subject,
        message: notifyPreview.slice(0, 160),
        is_read: false,
        created_at: timestamp,
      }))
    : [];

  const { error: messageError } = await client.from("messages").insert(messages);
  throwWriteError(messageError);
  if (notifications.length) {
    const { error: notificationError } = await client.from("notifications").insert(notifications);
    throwWriteError(notificationError);
  }

  const { sendFanEmails } = await import("@/lib/email");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await sendFanEmails(
    targets.map((user) => ({
      to: user.email,
      subject,
      text: `${body}\n\nOpen your dashboard: ${siteUrl}/dashboard/messages`,
    }))
  );

  return { sent: targets.length };
}

export async function notifyAllFansAbout(input: {
  title: string;
  message: string;
  inboxSubject: string;
  inboxBody: string;
  linkPath: string;
}): Promise<{ notified: number }> {
  const client = getSupabaseAdmin();
  const { data: users, error: usersError } = await client
    .from("app_users")
    .select("id, email")
    .eq("role", "fan");
  throwReadError(usersError);

  const fans = (users ?? []) as { id: string; email: string }[];
  if (!fans.length) return { notified: 0 };

  const timestamp = now();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const link = `${siteUrl}${input.linkPath}`;

  const notifications: NotificationRow[] = fans.map((fan) => ({
    id: randomUUID(),
    user_id: fan.id,
    title: input.title,
    message: input.message,
    is_read: false,
    created_at: timestamp,
  }));
  const messages: MessageRow[] = fans.map((fan) => ({
    id: randomUUID(),
    user_id: fan.id,
    subject: input.inboxSubject,
    body: `${input.inboxBody}\n\nView details: ${link}`,
    from_name: "Keanu Fan Team",
    is_read: false,
    status: "unread",
    created_at: timestamp,
  }));

  const { error: messageError } = await client.from("messages").insert(messages);
  throwWriteError(messageError);
  const { error: notificationError } = await client.from("notifications").insert(notifications);
  throwWriteError(notificationError);

  const { sendFanEmails } = await import("@/lib/email");
  await sendFanEmails(
    fans.map((fan) => ({
      to: fan.email,
      subject: input.inboxSubject,
      text: `${input.inboxBody}\n\nView details: ${link}`,
    }))
  );

  return { notified: fans.length };
}

export function createWelcomeContentForUser(userId: string, displayName: string) {
  const firstName = displayName.trim().split(/\s+/)[0] || "Fan";
  const timestamp = now();
  const welcomeBody = [
    `Hi ${firstName},`,
    "",
    "Welcome to the official Keanu Reeves fan community! Your account is now active.",
    "",
    "Apply for Silver, Gold, or Platinum membership from Dashboard → Membership to unlock giveaways, meet & greets, and private messaging.",
    "",
    "We're glad you're here. Explore the site and make yourself at home.",
    "",
    "— Keanu Fan Team",
  ].join("\n");

  const client = getSupabaseAdmin();
  void (async () => {
    const { error: messageError } = await client.from("messages").insert({
      id: randomUUID(),
      user_id: userId,
      subject: "Welcome to the fan community",
      body: welcomeBody,
      from_name: "Keanu Fan Team",
      is_read: false,
      status: "unread",
      created_at: timestamp,
    });
    throwWriteError(messageError);

    const { error: notificationError } = await client.from("notifications").insert({
      id: randomUUID(),
      user_id: userId,
      title: `Welcome, ${firstName}!`,
      message: "Your member account is ready. Check your inbox for a welcome message.",
      is_read: false,
      created_at: timestamp,
    });
    throwWriteError(notificationError);
  })().catch(() => undefined);
}

export async function markMessageAsRead(messageId: string, userId: string) {
  const client = getSupabaseAdmin();
  const { error } = await client
    .from("messages")
    .update({ is_read: true, status: "read" })
    .eq("id", messageId)
    .eq("user_id", userId);
  throwWriteError(error);
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  const client = getSupabaseAdmin();
  const { error } = await client
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);
  throwWriteError(error);
}

// ─── Admin stats ──────────────────────────────────────────────

export async function getAdminStats() {
  const client = getSupabaseAdmin();
  const [giveawayResult, eventResult, communityResult, entryResult] = await Promise.all([
    client.from("giveaways").select("id", { count: "exact", head: true }),
    client.from("meet_greet_events").select("id", { count: "exact", head: true }),
    client.from("communities").select("id", { count: "exact", head: true }),
    client.from("giveaway_entries").select("id", { count: "exact", head: true }),
  ]);

  throwReadError(giveawayResult.error);
  throwReadError(eventResult.error);
  throwReadError(communityResult.error);
  throwReadError(entryResult.error);

  return {
    giveawayCount: giveawayResult.count ?? 0,
    eventCount: eventResult.count ?? 0,
    communityCount: communityResult.count ?? 0,
    entryCount: entryResult.count ?? 0,
  };
}
