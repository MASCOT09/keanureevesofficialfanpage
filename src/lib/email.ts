import fs from "fs";
import path from "path";

export interface FanEmailPayload {
  to: string;
  subject: string;
  text: string;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM ?? "Keanu Fan <onboarding@resend.dev>";
}

function writeToOutbox(payload: FanEmailPayload): void {
  const outboxDir = path.join(process.cwd(), "data", "email-outbox");
  if (!fs.existsSync(outboxDir)) {
    fs.mkdirSync(outboxDir, { recursive: true });
  }

  const safeTo = payload.to.replace(/[^a-z0-9@._-]/gi, "_");
  const filename = `${Date.now()}-${safeTo}.txt`;
  const content = [
    `To: ${payload.to}`,
    `Subject: ${payload.subject}`,
    `Date: ${new Date().toISOString()}`,
    "",
    payload.text,
  ].join("\n");

  fs.writeFileSync(path.join(outboxDir, filename), content, "utf8");
}

export async function sendFanEmail(payload: FanEmailPayload): Promise<{
  delivered: boolean;
  simulated: boolean;
}> {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: getFromAddress(),
          to: payload.to,
          subject: payload.subject,
          text: payload.text,
        }),
      });

      if (response.ok) {
        return { delivered: true, simulated: false };
      }
    } catch {
      // fall through to outbox
    }
  }

  writeToOutbox(payload);
  return { delivered: false, simulated: true };
}

export async function sendFanEmails(
  payloads: FanEmailPayload[]
): Promise<{ delivered: number; simulated: number }> {
  let delivered = 0;
  let simulated = 0;

  for (const payload of payloads) {
    const result = await sendFanEmail(payload);
    if (result.delivered) delivered += 1;
    else simulated += 1;
  }

  return { delivered, simulated };
}
