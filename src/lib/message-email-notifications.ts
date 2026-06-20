import { sendFanEmail, sendFanEmails } from "@/lib/email";
import { getMembershipLabel, getMembershipPrice, MEMBERSHIP_PLANS } from "@/lib/membership";
import type { MembershipTier } from "@/types/membership";
import { getSiteUrl } from "@/lib/seo";

function inboxUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function logEmailBatch(label: string, result: { delivered: number; simulated: number; failed: number }) {
  console.info(
    `[email] ${label}: delivered=${result.delivered} simulated=${result.simulated} failed=${result.failed}`
  );
}

export async function sendSignupEmailAlerts(input: {
  fanUserId: string;
  fanName: string;
  fanEmail: string;
  country: string | null;
  adminEmails: string[];
}): Promise<void> {
  console.info("[email] signup alerts starting", {
    fan: input.fanEmail,
    adminCount: input.adminEmails.length,
  });

  if (input.adminEmails.length) {
    const adminResult = await sendFanEmails(
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
          `Open Team & Admins: ${inboxUrl("/admin/users")}`,
          "",
          "— Keanu Fan Site",
        ].join("\n"),
      }))
    );
    logEmailBatch("admin signup alert", adminResult);
  }

  const firstName = input.fanName.trim().split(/\s+/)[0] || "Fan";
  const welcomeResult = await sendFanEmail({
    to: input.fanEmail,
    subject: "Welcome to the fan community",
    text: [
      `Hi ${firstName},`,
      "",
      "Your account is ready on the official Keanu Reeves fan community.",
      "",
      "Log in to explore giveaways, meet & greets, membership plans, and your member inbox.",
      "",
      `Open your dashboard: ${inboxUrl("/dashboard")}`,
      "",
      "— Keanu Fan Team",
    ].join("\n"),
  });

  console.info("[email] fan welcome signup", welcomeResult);

  try {
    const { pushAlertToUser, pushAlertToAdmins } = await import("@/lib/push-alerts");
    await pushAlertToUser({
      userId: input.fanUserId,
      title: "Welcome to the fan community",
      body: "Your account is ready. Open your dashboard to get started.",
      url: "/dashboard",
    });
    await pushAlertToAdmins({
      title: "New fan signup",
      body: `${input.fanName} (${input.fanEmail}) just joined.`,
      url: "/admin/users",
    });
  } catch {
    // Push is optional.
  }
}

export async function sendMembershipApplicationEmailAlerts(input: {
  fanName: string;
  fanEmail: string;
  tier: Exclude<MembershipTier, "none">;
  adminEmails: string[];
}): Promise<void> {
  const planName = getMembershipLabel(input.tier);
  const amount = getMembershipPrice(input.tier);

  console.info("[email] membership application alerts starting", {
    fan: input.fanEmail,
    tier: input.tier,
    adminCount: input.adminEmails.length,
  });

  if (!input.adminEmails.length) return;

  const result = await sendFanEmails(
    input.adminEmails.map((to) => ({
      to,
      subject: "New membership application waiting for review",
      text: [
        "A fan just applied for membership.",
        "",
        `Name: ${input.fanName}`,
        `Email: ${input.fanEmail}`,
        `Plan: ${planName}`,
        `Amount: $${amount}`,
        "",
        "Log in to approve or reject the application.",
        "",
        `Open Membership Applications: ${inboxUrl("/admin/memberships")}`,
        "",
        "— Keanu Fan Site",
      ].join("\n"),
    }))
  );
  logEmailBatch("admin membership application", result);

  try {
    const { pushAlertToAdmins } = await import("@/lib/push-alerts");
    await pushAlertToAdmins({
      title: "New membership application",
      body: `${input.fanName} applied for ${planName} ($${amount}).`,
      url: "/admin/memberships",
    });
  } catch {
    // Push is optional.
  }
}

export async function notifyFanOfUnreadInboxMessage(input: {
  fanUserId: string;
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

  try {
    const { pushNewMessageToFan } = await import("@/lib/push-alerts");
    await pushNewMessageToFan(input.fanUserId, input.threadId);
  } catch {
    // Push is optional.
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

  try {
    const { pushNewFanMessageToAdmins } = await import("@/lib/push-alerts");
    await pushNewFanMessageToAdmins(fanName, input.threadId);
  } catch {
    // Push is optional.
  }
}
