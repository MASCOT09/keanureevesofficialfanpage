import { sendFanEmails } from "@/lib/email";

function inboxUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function notifyFanOfUnreadInboxMessage(input: {
  fanEmail: string;
  fanName: string;
  threadId: string;
}): Promise<void> {
  const name = input.fanName.trim() || "Fan";
  try {
    await sendFanEmails([
      {
        to: input.fanEmail,
        subject: "You have a new message",
        text: [
          `Hi ${name},`,
          "",
          "You have a new unread message in your fan dashboard inbox.",
          "Log in to read and reply — the message content is not included in this email.",
          "",
          `Open your inbox: ${inboxUrl(`/dashboard/messages/${input.threadId}`)}`,
          "",
          "— Keanu Fan Team",
        ].join("\n"),
      },
    ]);
  } catch {
    // Inbox was saved — email is optional.
  }
}

export async function notifyAdminsOfUnreadFanMessage(input: {
  adminEmails: string[];
  fanName: string;
  threadId: string;
}): Promise<void> {
  if (!input.adminEmails.length) return;

  const fanName = input.fanName.trim() || "A fan";
  try {
    await sendFanEmails(
      input.adminEmails.map((to) => ({
        to,
        subject: "New fan message waiting for reply",
        text: [
          `${fanName} sent a message in the fan inbox.`,
          "",
          "You have an unread message waiting in the admin panel.",
          "Log in to read and reply — the message content is not included in this email.",
          "",
          `Open the conversation: ${inboxUrl(`/admin/messages/${input.threadId}`)}`,
          "",
          "— Keanu Fan Site",
        ].join("\n"),
      }))
    );
  } catch {
    // Inbox was saved — email is optional.
  }
}
