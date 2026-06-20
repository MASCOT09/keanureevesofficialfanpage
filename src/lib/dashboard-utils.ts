import type { MessageStatus } from "@/types/messages";

export function formatDashboardDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDashboardTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDashboardDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getMessagePreview(body: string, maxLength = 100): string {
  const trimmed = body.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}…`;
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getMessageStatusLabel(status: MessageStatus): string {
  switch (status) {
    case "unread":
      return "Unread";
    case "read":
      return "Read";
    case "replied":
      return "Replied";
  }
}

export function getGiveawayPrize(description: string | null, title: string): string {
  if (description?.trim()) return description.trim();
  return title;
}

export function isUpcomingEvent(eventDate: string): boolean {
  return new Date(eventDate).getTime() > Date.now();
}

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export function getLastSeenStatus(lastSeenAt: string | null | undefined): {
  label: string;
  isOnline: boolean;
} {
  if (!lastSeenAt) {
    return { label: "Last online unknown", isOnline: false };
  }

  const elapsed = Date.now() - new Date(lastSeenAt).getTime();
  if (elapsed < ONLINE_WINDOW_MS) {
    return { label: "Online now", isOnline: true };
  }

  if (elapsed < 60 * 60 * 1000) {
    const minutes = Math.max(1, Math.floor(elapsed / 60000));
    return { label: `Last online ${minutes}m ago`, isOnline: false };
  }

  if (elapsed < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(elapsed / (60 * 60 * 1000));
    return { label: `Last online ${hours}h ago`, isOnline: false };
  }

  return { label: `Last online ${formatDashboardDateTime(lastSeenAt)}`, isOnline: false };
}
