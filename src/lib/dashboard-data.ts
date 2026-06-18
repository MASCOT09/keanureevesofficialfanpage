import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import {
  getActiveGiveaways,
  getGiveawayEntriesForUser,
  getMessagesForUser,
  getNotificationsForUser,
  getProfileById,
  getRegistrationsForUser,
  isExcelBackendReady,
} from "@/lib/repository";
import type { Giveaway } from "@/types/database";
import type { Message } from "@/types/messages";
import type { Notification } from "@/types/messages";
import type { Profile } from "@/types/database";

export interface DashboardGiveawayEntry {
  id: string;
  entered_at: string;
  giveaway: {
    id: string;
    title: string;
    ends_at: string;
    status: string;
  };
}

export interface DashboardEventRegistration {
  id: string;
  status: "confirmed" | "waitlist";
  registered_at: string;
  event: {
    id: string;
    title: string;
    event_date: string;
    location: string | null;
  };
}

export interface DashboardActiveGiveaway extends Giveaway {
  hasEntered: boolean;
}

export interface DashboardData {
  profile: Profile;
  email: string;
  firstName: string;
  unreadNotifications: number;
  stats: {
    totalMessages: number;
    meetGreetRequests: number;
    giveawayEntries: number;
    totalNotifications: number;
    memberSince: string;
  };
  recentMessages: Message[];
  recentNotifications: Notification[];
  giveawayEntries: DashboardGiveawayEntry[];
  eventRegistrations: DashboardEventRegistration[];
  upcomingEvents: DashboardEventRegistration[];
  activeGiveaways: DashboardActiveGiveaway[];
}

export interface DashboardShellData {
  profile: Profile;
  email: string;
  firstName: string;
  unreadNotifications: number;
  memberSince: string;
}

function getMemberSince(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function getFirstName(displayName: string | null): string {
  if (!displayName?.trim()) return "Fan";
  return displayName.trim().split(/\s+/)[0];
}

async function loadDashboardShell(): Promise<DashboardShellData | null> {
  if (!isExcelBackendReady()) return null;

  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getProfileById(user.id);
  if (!profile) return null;

  const notifications = await getNotificationsForUser(user.id);
  const unreadNotifications = notifications.filter((item) => !item.is_read).length;

  return {
    profile,
    email: user.email,
    firstName: getFirstName(profile.display_name),
    unreadNotifications,
    memberSince: getMemberSince(profile.created_at),
  };
}

async function loadDashboardData(): Promise<DashboardData | null> {
  const shell = await getDashboardShell();
  if (!shell) return null;

  const user = await getCurrentUser();
  if (!user) return null;

  const [messages, notifications, giveawayRows, registrationRows, activeGiveaways] =
    await Promise.all([
      getMessagesForUser(user.id),
      getNotificationsForUser(user.id),
      getGiveawayEntriesForUser(user.id),
      getRegistrationsForUser(user.id),
      getActiveGiveaways(),
    ]);

  const enteredSet = new Set(giveawayRows.map(({ entry }) => entry.giveaway_id));

  const giveawayEntries: DashboardGiveawayEntry[] = giveawayRows.map(({ entry, giveaway }) => ({
    id: entry.id,
    entered_at: entry.created_at,
    giveaway: {
      id: giveaway.id,
      title: giveaway.title,
      ends_at: giveaway.ends_at,
      status: giveaway.status,
    },
  }));

  const eventRegistrations: DashboardEventRegistration[] = registrationRows.map(
    ({ registration, event }) => ({
      id: registration.id,
      status: registration.status,
      registered_at: registration.created_at,
      event: {
        id: event.id,
        title: event.title,
        event_date: event.event_date,
        location: event.location,
      },
    })
  );

  const upcomingEvents = eventRegistrations
    .filter((reg) => new Date(reg.event.event_date).getTime() > Date.now())
    .sort(
      (a, b) =>
        new Date(a.event.event_date).getTime() - new Date(b.event.event_date).getTime()
    );

  const activeGiveawaysWithEntry: DashboardActiveGiveaway[] = activeGiveaways.map((giveaway) => ({
    ...giveaway,
    hasEntered: enteredSet.has(giveaway.id),
  }));

  return {
    profile: shell.profile,
    email: shell.email,
    firstName: shell.firstName,
    unreadNotifications: shell.unreadNotifications,
    stats: {
      totalMessages: messages.length,
      meetGreetRequests: eventRegistrations.length,
      giveawayEntries: giveawayEntries.length,
      totalNotifications: notifications.length,
      memberSince: shell.memberSince,
    },
    recentMessages: messages.slice(0, 5),
    recentNotifications: notifications.slice(0, 5),
    giveawayEntries,
    eventRegistrations,
    upcomingEvents,
    activeGiveaways: activeGiveawaysWithEntry,
  };
}

export const getDashboardShell = cache(loadDashboardShell);
export const getDashboardData = cache(loadDashboardData);
