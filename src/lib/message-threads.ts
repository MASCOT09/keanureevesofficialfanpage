import type { Message, MessageThread } from "@/types/messages";

export function buildMessageThreads(
  messages: Message[],
  fanLookup: Map<
    string,
    { name: string; email: string; membership_tier: string; last_seen_at?: string | null }
  >
): MessageThread[] {
  const byThread = new Map<string, Message[]>();

  for (const message of messages) {
    const list = byThread.get(message.thread_id) ?? [];
    list.push(message);
    byThread.set(message.thread_id, list);
  }

  const threads: MessageThread[] = [];

  for (const [threadId, threadMessages] of byThread) {
    const sorted = [...threadMessages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const fan = fanLookup.get(first.user_id) ?? {
      name: "Fan",
      email: "",
      membership_tier: "none",
      last_seen_at: null,
    };

    threads.push({
      thread_id: threadId,
      user_id: first.user_id,
      subject: first.subject,
      fan_name: fan.name,
      fan_email: fan.email,
      membership_tier: fan.membership_tier,
      fan_last_seen_at: fan.last_seen_at ?? null,
      last_message_at: last.created_at,
      last_message_preview: last.body.replace(/\s+/g, " ").trim().slice(0, 120),
      last_sender_role: last.sender_role,
      unread_for_admin: sorted.filter((m) => m.sender_role === "fan" && !m.is_read).length,
      unread_for_fan: sorted.filter((m) => m.sender_role === "admin" && !m.is_read).length,
      message_count: sorted.length,
    });
  }

  return threads.sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  );
}

export function countUnreadFanReplies(messages: Message[]): number {
  return messages.filter((m) => m.sender_role === "fan" && !m.is_read).length;
}

export function countUnreadAdminMessages(messages: Message[]): number {
  return messages.filter((m) => m.sender_role === "admin" && !m.is_read).length;
}
