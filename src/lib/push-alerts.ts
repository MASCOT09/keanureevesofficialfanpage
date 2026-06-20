export interface PushAlertInput {
  userId: string;
  title: string;
  body: string;
  url?: string;
}

export async function pushAlertToUser(input: PushAlertInput): Promise<void> {
  try {
    const { sendPushToUser } = await import("@/lib/push-notifications");
    await sendPushToUser(input);
  } catch {
    // Push is optional when VAPID keys are not configured.
  }
}

export async function pushAlertToAdmins(input: Omit<PushAlertInput, "userId">): Promise<void> {
  try {
    const { sendPushToAdmins } = await import("@/lib/push-notifications");
    await sendPushToAdmins(input);
  } catch {
    // Push is optional when VAPID keys are not configured.
  }
}

export async function pushNewMessageToFan(userId: string, threadId: string): Promise<void> {
  await pushAlertToUser({
    userId,
    title: "New message",
    body: "You have a new message from the fan team. Tap to read and reply.",
    url: `/dashboard/messages/${threadId}`,
  });
}

export async function pushNewFanMessageToAdmins(fanName: string, threadId: string): Promise<void> {
  const name = fanName.trim() || "A fan";
  await pushAlertToAdmins({
    title: "New fan message",
    body: `${name} sent a message. Tap to read and reply.`,
    url: `/admin/messages/${threadId}`,
  });
}
