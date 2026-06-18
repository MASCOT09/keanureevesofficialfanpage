import type { ContactLink, ContactRecipient } from "@/types/database";

export const CONTACT_RECIPIENT_LABELS: Record<ContactRecipient, string> = {
  keanu: "Keanu Reeves",
  team: "Keanu Reeves Manager Team",
};

export const CONTACT_RECIPIENTS: {
  id: ContactRecipient;
  title: string;
  description: string;
}[] = [
  {
    id: "keanu",
    title: "Keanu Reeves contact",
    description: "Choose WhatsApp, Zangi, or Telegram to message Keanu directly.",
  },
  {
    id: "team",
    title: "Keanu Reeves Manager Team",
    description: "Choose WhatsApp, Zangi, or Telegram to reach the official manager team.",
  },
];

export const CONTACT_PLATFORM_ORDER = ["whatsapp", "zangi", "telegram"] as const;

export function normalizeContactRecipient(value: string | undefined): ContactRecipient {
  return value === "team" ? "team" : "keanu";
}

export function normalizeContactUrl(raw: string, platform?: string): string {
  const url = raw.trim();
  if (!url) return "";

  const platformKey = platform?.toLowerCase();

  if (platformKey === "whatsapp") {
    const phone = extractWhatsAppPhone(url);
    if (phone) {
      return buildWhatsAppWebChatUrl(phone);
    }
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    return url;
  }

  const digitsOnly = url.replace(/\D/g, "");

  if (platformKey === "whatsapp") {
    if (url.startsWith("wa.me/")) {
      return `https://${url}`;
    }
    if (/^\+?\d[\d\s-]{7,}$/.test(url)) {
      return buildWhatsAppWebChatUrl(digitsOnly);
    }
  }

  if (platformKey === "telegram" && url.startsWith("t.me/")) {
    return `https://${url}`;
  }

  return `https://${url.replace(/^\/+/, "")}`;
}

export function extractWhatsAppPhone(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;

  const protocolMatch = url.match(/whatsapp:\/\/send\?phone=(\d+)/i);
  if (protocolMatch?.[1]) return protocolMatch[1];

  try {
    const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url.replace(/^\/+/, "")}`;
    const parsed = new URL(withProtocol);

    if (parsed.hostname.includes("wa.me")) {
      const phone = parsed.pathname.replace(/\D/g, "");
      if (phone.length >= 8) return phone;
    }

    if (parsed.hostname.includes("whatsapp.com")) {
      const phone = parsed.searchParams.get("phone")?.replace(/\D/g, "");
      if (phone && phone.length >= 8) return phone;
    }
  } catch {
    // fall through to digit parsing
  }

  if (/^\+?\d[\d\s-]{7,}$/.test(url)) {
    const digitsOnly = url.replace(/\D/g, "");
    if (digitsOnly.length >= 8) return digitsOnly;
  }

  return null;
}

export function buildWhatsAppDirectChatUrl(phone: string): string {
  return `whatsapp://send?phone=${phone.replace(/\D/g, "")}`;
}

export function buildWhatsAppWebChatUrl(phone: string): string {
  return `https://api.whatsapp.com/send?phone=${phone.replace(/\D/g, "")}`;
}

export interface TelegramTarget {
  type: "username" | "phone";
  value: string;
}

export function extractTelegramTarget(raw: string): TelegramTarget | null {
  const url = raw.trim();
  if (!url) return null;

  const protocolMatch = url.match(/tg:\/\/resolve\?(?:domain=([^&]+)|phone=([^&]+))/i);
  if (protocolMatch?.[1]) {
    return { type: "username", value: protocolMatch[1] };
  }
  if (protocolMatch?.[2]) {
    return { type: "phone", value: protocolMatch[2] };
  }

  try {
    const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url.replace(/^\/+/, "")}`;
    const parsed = new URL(withProtocol);

    if (parsed.hostname.includes("t.me") || parsed.hostname.includes("telegram.me")) {
      const segment = parsed.pathname.replace(/^\//, "").split("/")[0];
      if (!segment) return null;
      if (segment.startsWith("+")) {
        return { type: "phone", value: segment };
      }
      return { type: "username", value: segment };
    }
  } catch {
    // ignore invalid URLs
  }

  if (/^@?[a-zA-Z0-9_]{4,}$/.test(url)) {
    return { type: "username", value: url.replace(/^@/, "") };
  }

  return null;
}

export function buildTelegramDirectChatUrl(target: TelegramTarget): string {
  if (target.type === "phone") {
    return `tg://resolve?phone=${encodeURIComponent(target.value)}`;
  }
  return `tg://resolve?domain=${target.value}`;
}

export function buildTelegramWebChatUrl(target: TelegramTarget): string {
  if (target.type === "phone") {
    return `https://t.me/${encodeURIComponent(target.value)}`;
  }
  return `https://t.me/${target.value}`;
}

export function extractZangiId(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;

  const protocolMatch = url.match(/zangi:\/\/(?:chat\/)?([^/?#]+)/i);
  if (protocolMatch?.[1]) return protocolMatch[1];

  try {
    const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url.replace(/^\/+/, "")}`;
    const parsed = new URL(withProtocol);

    if (parsed.hostname.includes("zangi.com")) {
      const id = parsed.pathname.replace(/^\//, "").split("/")[0];
      if (id) return id;
    }
  } catch {
    // ignore invalid URLs
  }

  if (/^\d{5,}$/.test(url.replace(/\D/g, "")) && !url.includes(".")) {
    return url.replace(/\D/g, "");
  }

  return null;
}

export function buildZangiDirectChatUrl(id: string): string {
  return `zangi://chat/${id}`;
}

export function buildZangiWebChatUrl(id: string): string {
  return `https://zangi.com/${id}`;
}

export function pickContactLinkPerPlatform(links: ContactLink[]): ContactLink[] {
  const byPlatform = new Map<string, ContactLink>();

  for (const link of links) {
    const key = link.platform.toLowerCase();
    const existing = byPlatform.get(key);
    if (!existing || link.sort_order < existing.sort_order) {
      byPlatform.set(key, link);
    }
  }

  return CONTACT_PLATFORM_ORDER.map((platform) => byPlatform.get(platform)).filter(
    (link): link is ContactLink => Boolean(link)
  );
}

export function getTeamContactLinks(links: ContactLink[]): ContactLink[] {
  return pickContactLinkPerPlatform(
    links.filter((link) => normalizeContactRecipient(link.recipient) === "team")
  );
}

export function groupContactLinksByRecipient(links: ContactLink[]) {
  return CONTACT_RECIPIENTS.map((section) => ({
    ...section,
    links: links
      .filter((link) => normalizeContactRecipient(link.recipient) === section.id)
      .sort(
        (a, b) =>
          CONTACT_PLATFORM_ORDER.indexOf(a.platform as (typeof CONTACT_PLATFORM_ORDER)[number]) -
          CONTACT_PLATFORM_ORDER.indexOf(b.platform as (typeof CONTACT_PLATFORM_ORDER)[number])
      ),
  }));
}
