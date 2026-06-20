import webpush from "web-push";
import {
  deletePushSubscription,
  getAdminUserList,
  getPushSubscriptionsForUser,
} from "@/lib/repository";

export interface PushAlertInput {
  userId: string;
  title: string;
  body: string;
  url?: string;
}

function isPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() &&
      process.env.VAPID_PRIVATE_KEY?.trim()
  );
}

function configureWebPush(): boolean {
  if (!isPushConfigured()) return false;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT?.trim() || "mailto:support@keanu.fan",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!.trim(),
    process.env.VAPID_PRIVATE_KEY!.trim()
  );
  return true;
}

export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || null;
}

export async function sendPushToUser(input: PushAlertInput): Promise<void> {
  if (!configureWebPush()) return;

  const subscriptions = await getPushSubscriptionsForUser(input.userId);
  if (!subscriptions.length) return;

  const payload = JSON.stringify({
    title: input.title,
    body: input.body,
    url: input.url ?? "/dashboard",
  });

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload
        );
      } catch (error) {
        const statusCode =
          error && typeof error === "object" && "statusCode" in error
            ? Number((error as { statusCode: number }).statusCode)
            : 0;
        if (statusCode === 404 || statusCode === 410) {
          await deletePushSubscription(input.userId, subscription.endpoint);
        }
        console.error("[push] delivery failed", statusCode || error);
      }
    })
  );
}

export async function sendPushToAdmins(input: Omit<PushAlertInput, "userId">): Promise<void> {
  const admins = (await getAdminUserList()).filter((user) => user.role === "admin");
  await Promise.all(
    admins.map((admin) =>
      sendPushToUser({
        userId: admin.id,
        title: input.title,
        body: input.body,
        url: input.url,
      })
    )
  );
}
