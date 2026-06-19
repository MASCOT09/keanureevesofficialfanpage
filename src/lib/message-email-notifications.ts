import { sendFanEmails } from "@/lib/email";
import { getMembershipLabel, MEMBERSHIP_PLANS } from "@/lib/membership";
import type { MembershipTier } from "@/types/membership";
import { getSiteUrl } from "@/lib/seo";

function inboxUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
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

export async function notifyFanOfMembershipUpgrade(input: {
  fanEmail: string;
  fanName: string;
  tier: Exclude<MembershipTier, "none">;
  previousTier: MembershipTier;
}): Promise<void> {
  const firstName = input.fanName.trim().split(/\s+/)[0] || "Fan";
  const planName = getMembershipLabel(input.tier);
  const plan = MEMBERSHIP_PLANS.find((item) => item.tier === input.tier);
  const highlights = plan?.highlights.slice(0, 3).map((line) => `• ${line}`).join("\n") ?? "";
  const membershipUrl = inboxUrl("/dashboard/membership");

  const headline =
    input.previousTier === "none"
      ? `You've just attained ${planName} membership.`
      : `You've been upgraded to ${planName}.`;

  try {
    await sendFanEmails([
      {
        to: input.fanEmail,
        subject: `Welcome to ${planName}`,
        text: [
          `Hi ${firstName},`,
          "",
          headline,
          "",
          "Your member benefits are now active on the official Keanu Reeves fan community.",
          highlights ? `\nWhat's included:\n${highlights}` : "",
          "",
          `View your membership: ${membershipUrl}`,
          "",
          "Welcome aboard,",
          "Keanu Fan Team",
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ]);
  } catch {
    // Membership was saved — email is optional.
  }
}

export async function notifyAdminsOfNewMembershipApplication(input: {
  adminEmails: string[];
  fanName: string;
  fanEmail: string;
  tier: Exclude<MembershipTier, "none">;
  amount: number;
}): Promise<void> {
  if (!input.adminEmails.length) return;

  const planName = getMembershipLabel(input.tier);
  const adminUrl = inboxUrl("/admin/memberships");

  try {
    await sendFanEmails(
      input.adminEmails.map((to) => ({
        to,
        subject: "New membership application waiting for review",
        text: [
          "A fan just applied for membership.",
          "",
          `Name: ${input.fanName}`,
          `Email: ${input.fanEmail}`,
          `Plan: ${planName}`,
          `Amount: $${input.amount}`,
          "",
          "Log in to approve or reject the application.",
          "",
          `Open Membership Applications: ${adminUrl}`,
          "",
          "— Keanu Fan Site",
        ].join("\n"),
      }))
    );
  } catch {
    // Application was saved — email alert is optional.
  }
}

export async function notifyAdminsOfNewFanSignup(input: {
  adminEmails: string[];
  fanName: string;
  fanEmail: string;
  country: string | null;
}): Promise<void> {
  if (!input.adminEmails.length) return;

  const adminUrl = inboxUrl("/admin/users");

  try {
    await sendFanEmails(
      input.adminEmails.map((to) => ({
        to,
        subject: "New fan signup on your site",
        text: [
          "A new fan just created an account.",
          "",
          `Name: ${input.fanName}`,
          `Email: ${input.fanEmail}`,
          input.country ? `Country: ${input.country}` : "Country: not provided",
          "",
          "Log in to the admin panel to review the new member.",
          "",
          `Open Team & Admins: ${adminUrl}`,
          "",
          "— Keanu Fan Site",
        ].join("\n"),
      }))
    );
  } catch {
    // Signup succeeded — email alert is optional.
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
