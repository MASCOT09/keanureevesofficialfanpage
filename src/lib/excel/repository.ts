import { cache } from "react";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import {
  parseBool,
  readSheet,
  readSheets,
  writeMultipleSheets,
  writeSheet,
  workbookExists,
  type SheetName,
} from "./db";
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
import type { Message } from "@/types/messages";
import { normalizeContactUrl } from "@/lib/contact-dms";
import { SITE_BUTTON_DEFAULTS } from "@/lib/site-button-defaults";
import {
  getMembershipPrice,
  normalizeMembershipStatus,
  normalizeMembershipTier,
} from "@/lib/membership";
import type { MembershipApplication, MembershipApplicationStatus } from "@/types/membership";

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

function now() {
  return new Date().toISOString();
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

export function isExcelBackendReady(): boolean {
  return workbookExists();
}

// ─── Users / Auth ───────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const users = readSheet<UserRow>("users");
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

async function findUserByIdUncached(id: string): Promise<UserRow | null> {
  const users = readSheet<UserRow>("users");
  return users.find((u) => u.id === id) ?? null;
}

export const findUserById = cache(findUserByIdUncached);

export async function createUser(
  email: string,
  password: string,
  displayName: string,
  country?: string | null
): Promise<UserRow> {
  const sheets = readSheets<UserRow | MessageRow | NotificationRow>([
    "users",
    "messages",
    "notifications",
  ]);
  const users = (sheets.users ?? []) as UserRow[];
  const messages = (sheets.messages ?? []) as MessageRow[];
  const notifications = (sheets.notifications ?? []) as NotificationRow[];

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
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

  users.push(user);

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

  messages.unshift({
    id: randomUUID(),
    user_id: user.id,
    subject: "Welcome to the fan community",
    body: welcomeBody,
    from_name: "Keanu Fan Team",
    is_read: false,
    status: "unread",
    created_at: timestamp,
  });

  notifications.unshift({
    id: randomUUID(),
    user_id: user.id,
    title: `Welcome, ${firstName}!`,
    message: "Your member account is ready. Check your inbox for a welcome message.",
    is_read: false,
    created_at: timestamp,
  });

  writeMultipleSheets({
    users,
    messages,
    notifications,
  });

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
  const users = readSheet<UserRow>("users");
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new Error("User not found.");
  users[index].display_name = data.displayName.trim();
  users[index].country = data.country?.trim() || null;
  if (data.avatarUrl !== undefined) {
    users[index].avatar_url = data.avatarUrl;
  }
  writeSheet("users", users);
}

export async function updateUserAvatar(id: string, avatarUrl: string | null) {
  const users = readSheet<UserRow>("users");
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new Error("User not found.");
  users[index].avatar_url = avatarUrl;
  writeSheet("users", users);
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
  return readSheet<UserRow>("users")
    .map(({ id, email, display_name, role, country, created_at, membership_tier, membership_status }) => ({
      id,
      email,
      display_name,
      role,
      country: country ?? null,
      created_at,
      membership_tier: normalizeMembershipTier(membership_tier),
      membership_status: normalizeMembershipStatus(membership_status),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function countAdmins(): Promise<number> {
  return readSheet<UserRow>("users").filter((u) => u.role === "admin").length;
}

export async function updateUserRole(
  actorId: string,
  targetUserId: string,
  role: UserRole
): Promise<void> {
  if (role !== "fan" && role !== "admin") {
    throw new Error("Invalid role.");
  }

  const users = readSheet<UserRow>("users");
  const targetIndex = users.findIndex((u) => u.id === targetUserId);
  if (targetIndex === -1) throw new Error("User not found.");

  const target = users[targetIndex];
  if (target.role === role) return;

  const adminCount = users.filter((u) => u.role === "admin").length;

  if (target.role === "admin" && role === "fan") {
    if (adminCount <= 1) {
      throw new Error("Cannot remove the last admin. Promote another admin first.");
    }
    if (targetUserId === actorId) {
      throw new Error("You cannot remove your own admin access. Ask another admin to change your role.");
    }
  }

  users[targetIndex].role = role;
  if (role === "admin") {
    users[targetIndex].membership_tier = "platinum";
    users[targetIndex].membership_status = "active";
  }
  writeSheet("users", users);
}

export async function updateUserMembership(
  targetUserId: string,
  tier: import("@/types/membership").MembershipTier
): Promise<void> {
  if (tier !== "none" && tier !== "silver" && tier !== "gold" && tier !== "platinum") {
    throw new Error("Invalid membership tier.");
  }

  const users = readSheet<UserRow>("users");
  const targetIndex = users.findIndex((u) => u.id === targetUserId);
  if (targetIndex === -1) throw new Error("User not found.");

  if (users[targetIndex].role === "admin") {
    throw new Error("Admins always have Platinum membership.");
  }

  users[targetIndex].membership_tier = tier;
  users[targetIndex].membership_status = tier === "none" ? "none" : "active";
  writeSheet("users", users);
}

// ─── Membership ───────────────────────────────────────────────

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

function toMembershipApplication(row: MembershipApplicationRow): MembershipApplication {
  return {
    ...row,
    tier: row.tier as MembershipApplication["tier"],
    reviewed_at: row.reviewed_at ?? null,
  };
}

export async function getLatestMembershipApplicationForUser(
  userId: string
): Promise<MembershipApplication | null> {
  const application = readSheet<MembershipApplicationRow>("membership_applications")
    .filter((row) => row.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  return application ? toMembershipApplication(application) : null;
}

export async function getAllMembershipApplications(): Promise<MembershipApplication[]> {
  return readSheet<MembershipApplicationRow>("membership_applications")
    .map(toMembershipApplication)
    .sort((a, b) => {
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

  const applications = readSheet<MembershipApplicationRow>("membership_applications");
  const users = readSheet<UserRow>("users");
  const userIndex = users.findIndex((row) => row.id === userId);
  if (userIndex === -1) throw new Error("User not found.");

  const pending = applications.find(
    (row) => row.user_id === userId && row.status === "pending"
  );
  if (pending) {
    throw new Error("You already have a membership application under review.");
  }

  const currentTier = normalizeMembershipTier(user.membership_tier);
  const currentStatus = normalizeMembershipStatus(user.membership_status);
  const tierRank = { none: 0, silver: 1, gold: 2, platinum: 3 };

  if (currentStatus === "active" && tierRank[currentTier] >= tierRank[tier]) {
    throw new Error("You already have this membership level or higher.");
  }

  const timestamp = now();
  applications.unshift({
    id: randomUUID(),
    user_id: userId,
    user_email: user.email,
    user_name: user.display_name,
    tier,
    amount: getMembershipPrice(tier),
    status: "pending",
    created_at: timestamp,
    reviewed_at: null,
  });

  users[userIndex].membership_status = "pending";

  writeMultipleSheets({
    membership_applications: applications,
    users,
  });
}

async function notifyMembershipDecision(
  userId: string,
  subject: string,
  body: string,
  notificationTitle: string,
  notificationMessage: string
) {
  const sheets = readSheets<MessageRow | NotificationRow>(["messages", "notifications"]);
  const messages = (sheets.messages ?? []) as MessageRow[];
  const notifications = (sheets.notifications ?? []) as NotificationRow[];
  const timestamp = now();

  messages.unshift({
    id: randomUUID(),
    user_id: userId,
    subject,
    body,
    from_name: "Keanu Fan Team",
    is_read: false,
    status: "unread",
    created_at: timestamp,
  });

  notifications.unshift({
    id: randomUUID(),
    user_id: userId,
    title: notificationTitle,
    message: notificationMessage,
    is_read: false,
    created_at: timestamp,
  });

  writeMultipleSheets({ messages, notifications });
}

export async function approveMembershipApplication(applicationId: string) {
  const applications = readSheet<MembershipApplicationRow>("membership_applications");
  const users = readSheet<UserRow>("users");
  const index = applications.findIndex((row) => row.id === applicationId);

  if (index === -1) throw new Error("Application not found.");
  const application = applications[index];
  if (application.status !== "pending") {
    throw new Error("This application has already been reviewed.");
  }

  const userIndex = users.findIndex((row) => row.id === application.user_id);
  if (userIndex === -1) throw new Error("Applicant not found.");

  const timestamp = now();
  applications[index] = {
    ...application,
    status: "approved",
    reviewed_at: timestamp,
  };

  users[userIndex].membership_tier = application.tier;
  users[userIndex].membership_status = "active";

  writeMultipleSheets({
    membership_applications: applications,
    users,
  });

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
  const applications = readSheet<MembershipApplicationRow>("membership_applications");
  const users = readSheet<UserRow>("users");
  const index = applications.findIndex((row) => row.id === applicationId);

  if (index === -1) throw new Error("Application not found.");
  const application = applications[index];
  if (application.status !== "pending") {
    throw new Error("This application has already been reviewed.");
  }

  const userIndex = users.findIndex((row) => row.id === application.user_id);
  if (userIndex === -1) throw new Error("Applicant not found.");

  const timestamp = now();
  applications[index] = {
    ...application,
    status: "rejected",
    reviewed_at: timestamp,
  };

  const user = users[userIndex];
  const stillActive =
    normalizeMembershipStatus(user.membership_status) === "active" &&
    normalizeMembershipTier(user.membership_tier) !== "none";

  if (!stillActive) {
    users[userIndex].membership_status = "none";
  }

  writeMultipleSheets({
    membership_applications: applications,
    users,
  });

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
  const rows = readSheet<SiteSettings>("site_settings");
  return rows[0] ?? null;
}

export async function updateSiteSettings(data: {
  celebrity_name: string;
  tagline: string;
  hero_video_url: string;
}) {
  writeSheet("site_settings", [
    {
      id: 1,
      celebrity_name: data.celebrity_name,
      tagline: data.tagline,
      hero_video_url: data.hero_video_url,
      updated_at: now(),
    },
  ]);
}

// ─── Giveaways ────────────────────────────────────────────────

export async function getGiveaways(): Promise<Giveaway[]> {
  return readSheet<Giveaway>("giveaways")
    .filter((g) => g.status === "active" || g.status === "closed")
    .sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime());
}

export async function getAllGiveaways(): Promise<Giveaway[]> {
  return readSheet<Giveaway>("giveaways").sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getActiveGiveaways(): Promise<Giveaway[]> {
  const now = Date.now();
  return readSheet<Giveaway>("giveaways")
    .filter((g) => g.status === "active" && new Date(g.ends_at).getTime() > now)
    .sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime());
}

export async function getGiveawayEntryIdsForUser(userId: string): Promise<string[]> {
  return readSheet<GiveawayEntry>("giveaway_entries")
    .filter((e) => e.user_id === userId)
    .map((e) => e.giveaway_id);
}

export async function getGiveawayById(id: string): Promise<Giveaway | null> {
  return readSheet<Giveaway>("giveaways").find((g) => g.id === id) ?? null;
}

export async function createGiveaway(data: Omit<Giveaway, "created_at"> & { id?: string }) {
  const giveaways = readSheet<Giveaway>("giveaways");
  const id = data.id ?? randomUUID();
  giveaways.unshift({ ...data, id, created_at: now() });
  writeSheet("giveaways", giveaways);
  return id;
}

export async function updateGiveaway(id: string, data: Partial<Giveaway>) {
  const giveaways = readSheet<Giveaway>("giveaways");
  const index = giveaways.findIndex((g) => g.id === id);
  if (index === -1) throw new Error("Giveaway not found.");
  giveaways[index] = { ...giveaways[index], ...data, id };
  writeSheet("giveaways", giveaways);
}

export async function deleteGiveaway(id: string) {
  writeSheet(
    "giveaways",
    readSheet<Giveaway>("giveaways").filter((g) => g.id !== id)
  );
  writeSheet(
    "giveaway_entries",
    readSheet<GiveawayEntry>("giveaway_entries").filter((e) => e.giveaway_id !== id)
  );
}

// ─── Giveaway Entries ─────────────────────────────────────────

export async function getGiveawayEntriesForUser(userId: string) {
  const entries = readSheet<GiveawayEntry>("giveaway_entries").filter(
    (e) => e.user_id === userId
  );
  const giveaways = readSheet<Giveaway>("giveaways");

  return entries
    .map((entry) => {
      const giveaway = giveaways.find((g) => g.id === entry.giveaway_id);
      if (!giveaway) return null;
      return { entry, giveaway };
    })
    .filter((row): row is { entry: GiveawayEntry; giveaway: Giveaway } => row !== null)
    .sort(
      (a, b) =>
        new Date(b.entry.created_at).getTime() - new Date(a.entry.created_at).getTime()
    );
}

export async function hasGiveawayEntry(userId: string, giveawayId: string): Promise<boolean> {
  return readSheet<GiveawayEntry>("giveaway_entries").some(
    (e) => e.user_id === userId && e.giveaway_id === giveawayId
  );
}

export async function createGiveawayEntry(userId: string, giveawayId: string) {
  const entries = readSheet<GiveawayEntry>("giveaway_entries");
  if (entries.some((e) => e.user_id === userId && e.giveaway_id === giveawayId)) {
    throw new Error("You have already entered this giveaway.");
  }

  entries.push({
    id: randomUUID(),
    giveaway_id: giveawayId,
    user_id: userId,
    created_at: now(),
  });
  writeSheet("giveaway_entries", entries);
}

export async function countGiveawayEntries(): Promise<number> {
  return readSheet<GiveawayEntry>("giveaway_entries").length;
}

// ─── Meet & Greet ─────────────────────────────────────────────

export async function getMeetGreetEvents(): Promise<MeetGreetEvent[]> {
  return readSheet<MeetGreetEvent>("meet_greet_events")
    .filter((e) => e.status === "upcoming" || e.status === "closed")
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
}

export async function getAllMeetGreetEvents(): Promise<MeetGreetEvent[]> {
  return readSheet<MeetGreetEvent>("meet_greet_events").sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );
}

export async function getMeetGreetEventById(id: string): Promise<MeetGreetEvent | null> {
  return readSheet<MeetGreetEvent>("meet_greet_events").find((e) => e.id === id) ?? null;
}

export async function createMeetGreetEvent(
  data: Omit<MeetGreetEvent, "id" | "created_at">
) {
  const events = readSheet<MeetGreetEvent>("meet_greet_events");
  events.push({ ...data, id: randomUUID(), created_at: now() });
  writeSheet("meet_greet_events", events);
}

export async function updateMeetGreetEvent(id: string, data: Partial<MeetGreetEvent>) {
  const events = readSheet<MeetGreetEvent>("meet_greet_events");
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) throw new Error("Event not found.");
  events[index] = { ...events[index], ...data, id };
  writeSheet("meet_greet_events", events);
}

export async function deleteMeetGreetEvent(id: string) {
  writeSheet(
    "meet_greet_events",
    readSheet<MeetGreetEvent>("meet_greet_events").filter((e) => e.id !== id)
  );
  writeSheet(
    "meet_greet_registrations",
    readSheet<MeetGreetRegistration>("meet_greet_registrations").filter(
      (r) => r.event_id !== id
    )
  );
}

// ─── Registrations ────────────────────────────────────────────

export async function getRegistrationsForUser(userId: string) {
  const registrations = readSheet<MeetGreetRegistration>("meet_greet_registrations").filter(
    (r) => r.user_id === userId
  );
  const events = readSheet<MeetGreetEvent>("meet_greet_events");

  return registrations
    .map((registration) => {
      const event = events.find((e) => e.id === registration.event_id);
      if (!event) return null;
      return { registration, event };
    })
    .filter(
      (row): row is { registration: MeetGreetRegistration; event: MeetGreetEvent } =>
        row !== null
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
  return (
    readSheet<MeetGreetRegistration>("meet_greet_registrations").find(
      (r) => r.user_id === userId && r.event_id === eventId
    ) ?? null
  );
}

export async function countConfirmedRegistrations(eventId: string): Promise<number> {
  return readSheet<MeetGreetRegistration>("meet_greet_registrations").filter(
    (r) => r.event_id === eventId && r.status === "confirmed"
  ).length;
}

export async function createMeetGreetRegistration(userId: string, eventId: string) {
  const registrations = readSheet<MeetGreetRegistration>("meet_greet_registrations");
  if (registrations.some((r) => r.user_id === userId && r.event_id === eventId)) {
    throw new Error("You are already registered for this event.");
  }

  const event = await getMeetGreetEventById(eventId);
  if (!event) throw new Error("Event not found.");

  const confirmedCount = await countConfirmedRegistrations(eventId);
  const status = confirmedCount >= event.max_spots ? "waitlist" : "confirmed";

  registrations.push({
    id: randomUUID(),
    event_id: eventId,
    user_id: userId,
    status,
    created_at: now(),
  });
  writeSheet("meet_greet_registrations", registrations);
  return status;
}

// ─── Communities ──────────────────────────────────────────────

export async function getCommunities(): Promise<Community[]> {
  return readSheet<CommunityRow>("communities")
    .filter((c) => parseBool(c.is_active))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toCommunity);
}

export async function getAllCommunities(): Promise<Community[]> {
  return readSheet<CommunityRow>("communities")
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toCommunity);
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

function toCommunity(row: CommunityRow): Community {
  return {
    ...row,
    is_active: parseBool(row.is_active),
    sort_order: Number(row.sort_order) || 0,
  };
}

export async function createCommunity(data: {
  name: string;
  description: string;
  platform: string;
  url: string;
  is_active: boolean;
  sort_order: number;
}) {
  const communities = readSheet<CommunityRow>("communities");
  communities.push({
    id: randomUUID(),
    name: data.name,
    description: data.description,
    platform: data.platform,
    url: data.url,
    is_active: data.is_active,
    sort_order: data.sort_order,
    created_at: now(),
  });
  writeSheet("communities", communities);
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
  const communities = readSheet<CommunityRow>("communities");
  const index = communities.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Community not found.");
  communities[index] = { ...communities[index], ...data, id };
  writeSheet("communities", communities);
}

export async function deleteCommunity(id: string) {
  writeSheet(
    "communities",
    readSheet<CommunityRow>("communities").filter((c) => c.id !== id)
  );
}

// ─── Contact Links ────────────────────────────────────────────

export async function getContactLinks(): Promise<ContactLink[]> {
  return readSheet<ContactLinkRow>("contact_links")
    .filter((l) => parseBool(l.is_active))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toContactLink);
}

export async function getAllContactLinks(): Promise<ContactLink[]> {
  return readSheet<ContactLinkRow>("contact_links")
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toContactLink);
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

function toContactLink(row: ContactLinkRow): ContactLink {
  return {
    ...row,
    recipient: row.recipient === "team" ? "team" : "keanu",
    url: normalizeContactUrl(row.url, row.platform),
    is_active: parseBool(row.is_active),
    sort_order: Number(row.sort_order) || 0,
  };
}

export async function createContactLink(data: {
  platform: string;
  recipient: string;
  label: string;
  url: string;
  is_active: boolean;
  sort_order: number;
}) {
  const links = readSheet<ContactLinkRow>("contact_links");
  links.push({
    id: randomUUID(),
    platform: data.platform,
    recipient: data.recipient === "team" ? "team" : "keanu",
    label: data.label,
    url: normalizeContactUrl(data.url, data.platform),
    is_active: data.is_active,
    sort_order: data.sort_order,
    created_at: now(),
  });
  writeSheet("contact_links", links);
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
  const links = readSheet<ContactLinkRow>("contact_links");
  const index = links.findIndex((l) => l.id === id);
  if (index === -1) throw new Error("Contact link not found.");
  links[index] = {
    ...links[index],
    ...data,
    id,
    recipient: data.recipient === "team" ? "team" : "keanu",
    url: normalizeContactUrl(data.url, data.platform),
  };
  writeSheet("contact_links", links);
}

export async function deleteContactLink(id: string) {
  writeSheet(
    "contact_links",
    readSheet<ContactLinkRow>("contact_links").filter((l) => l.id !== id)
  );
}

// ─── Site buttons ───────────────────────────────────────────────

interface SiteButtonRow {
  id: string;
  button_key: string;
  section: string;
  label: string;
  href: string;
  description?: string | null;
  is_active: boolean | string;
  sort_order: number;
  open_in_new_tab: boolean | string;
  updated_at: string;
}

function toSiteButton(row: SiteButtonRow): SiteButton {
  return {
    id: row.id,
    button_key: row.button_key,
    section: row.section,
    label: row.label,
    href: row.href,
    description: row.description ?? null,
    is_active: parseBool(row.is_active),
    sort_order: Number(row.sort_order) || 0,
    open_in_new_tab: parseBool(row.open_in_new_tab),
    updated_at: row.updated_at,
  };
}

function seedSiteButtonsIfEmpty() {
  const existing = readSheet<SiteButtonRow>("site_buttons");
  if (existing.length) return;
  const seeded = SITE_BUTTON_DEFAULTS.map((row) => ({
    ...row,
    updated_at: now(),
  }));
  writeSheet("site_buttons", seeded);
}

export async function getAllSiteButtons(): Promise<SiteButton[]> {
  if (!workbookExists()) {
    return SITE_BUTTON_DEFAULTS.map((row) => ({ ...row, updated_at: now() }));
  }
  seedSiteButtonsIfEmpty();
  return readSheet<SiteButtonRow>("site_buttons")
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
  seedSiteButtonsIfEmpty();
  const buttons = readSheet<SiteButtonRow>("site_buttons");
  const index = buttons.findIndex((b) => b.id === id);
  if (index === -1) throw new Error("Site button not found.");
  buttons[index] = {
    ...buttons[index],
    label: data.label,
    href: data.href,
    is_active: data.is_active,
    open_in_new_tab: data.open_in_new_tab,
    updated_at: now(),
  };
  writeSheet("site_buttons", buttons);
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

interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean | string;
  created_at: string;
}

export async function getMessagesForUser(userId: string): Promise<Message[]> {
  return readSheet<MessageRow>("messages")
    .filter((m) => m.user_id === userId)
    .map(mapMessage)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function countMessagesForUser(userId: string): Promise<number> {
  return readSheet<MessageRow>("messages").filter((m) => m.user_id === userId).length;
}

export async function getNotificationsForUser(userId: string) {
  return readSheet<NotificationRow>("notifications")
    .filter((n) => n.user_id === userId)
    .map((n) => ({ ...n, is_read: parseBool(n.is_read) }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  return readSheet<NotificationRow>("notifications").filter(
    (n) => n.user_id === userId && !parseBool(n.is_read)
  ).length;
}

export async function getFansForMessaging(): Promise<AdminUserSummary[]> {
  return readSheet<UserRow>("users")
    .filter((u) => u.role === "fan")
    .map(({ id, email, display_name, role, country, created_at, membership_tier, membership_status }) => ({
      id,
      email,
      display_name,
      role,
      country: country ?? null,
      created_at,
      membership_tier: normalizeMembershipTier(membership_tier),
      membership_status: normalizeMembershipStatus(membership_status),
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

  const users = readSheet<UserRow>("users");
  const targets =
    input.recipient === "all"
      ? users.filter((u) => u.role === "fan")
      : users.filter((u) => u.id === input.recipient);

  if (!targets.length) {
    throw new Error("No fans found for this recipient.");
  }

  const sheets = readSheets<MessageRow | NotificationRow>(["messages", "notifications"]);
  const messages = (sheets.messages ?? []) as MessageRow[];
  const notifications = (sheets.notifications ?? []) as NotificationRow[];
  const timestamp = now();
  const notifyPreview = body.split("\n").find((line) => line.trim())?.trim() ?? subject;

  for (const user of targets) {
    messages.unshift({
      id: randomUUID(),
      user_id: user.id,
      subject,
      body,
      from_name: fromName,
      is_read: false,
      status: "unread",
      created_at: timestamp,
    });

    if (input.alsoNotify) {
      notifications.unshift({
        id: randomUUID(),
        user_id: user.id,
        title: subject,
        message: notifyPreview.slice(0, 160),
        is_read: false,
        created_at: timestamp,
      });
    }
  }

  writeMultipleSheets({ messages, notifications });

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
  const fans = readSheet<UserRow>("users").filter((u) => u.role === "fan");
  if (!fans.length) return { notified: 0 };

  const sheets = readSheets<MessageRow | NotificationRow>(["messages", "notifications"]);
  const messages = (sheets.messages ?? []) as MessageRow[];
  const notifications = (sheets.notifications ?? []) as NotificationRow[];
  const timestamp = now();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const link = `${siteUrl}${input.linkPath}`;

  for (const fan of fans) {
    notifications.unshift({
      id: randomUUID(),
      user_id: fan.id,
      title: input.title,
      message: input.message,
      is_read: false,
      created_at: timestamp,
    });

    messages.unshift({
      id: randomUUID(),
      user_id: fan.id,
      subject: input.inboxSubject,
      body: `${input.inboxBody}\n\nView details: ${link}`,
      from_name: "Keanu Fan Team",
      is_read: false,
      status: "unread",
      created_at: timestamp,
    });
  }

  writeMultipleSheets({ messages, notifications });

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

  const messages = readSheet<MessageRow>("messages");
  messages.unshift({
    id: randomUUID(),
    user_id: userId,
    subject: "Welcome to the fan community",
    body: welcomeBody,
    from_name: "Keanu Fan Team",
    is_read: false,
    status: "unread",
    created_at: timestamp,
  });
  writeSheet("messages", messages);

  const notifications = readSheet<NotificationRow>("notifications");
  notifications.unshift({
    id: randomUUID(),
    user_id: userId,
    title: `Welcome, ${firstName}!`,
    message: "Your member account is ready. Check your inbox for a welcome message.",
    is_read: false,
    created_at: timestamp,
  });
  writeSheet("notifications", notifications);
}

export async function markMessageAsRead(messageId: string, userId: string) {
  const messages = readSheet<MessageRow>("messages");
  const index = messages.findIndex((m) => m.id === messageId && m.user_id === userId);
  if (index === -1) return;
  messages[index] = { ...messages[index], is_read: true, status: "read" };
  writeSheet("messages", messages);
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  const notifications = readSheet<NotificationRow>("notifications");
  const index = notifications.findIndex(
    (n) => n.id === notificationId && n.user_id === userId
  );
  if (index === -1) return;
  notifications[index] = { ...notifications[index], is_read: true };
  writeSheet("notifications", notifications);
}

// ─── Admin stats ──────────────────────────────────────────────

export async function getAdminStats() {
  return {
    giveawayCount: readSheet<Giveaway>("giveaways").length,
    eventCount: readSheet<MeetGreetEvent>("meet_greet_events").length,
    communityCount: readSheet<CommunityRow>("communities").length,
    entryCount: readSheet<GiveawayEntry>("giveaway_entries").length,
  };
}

export type { SheetName };
