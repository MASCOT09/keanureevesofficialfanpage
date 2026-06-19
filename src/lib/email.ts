import fs from "fs";
import path from "path";

export interface FanEmailPayload {
  to: string;
  subject: string;
  text: string;
}

export interface SendFanEmailResult {
  delivered: boolean;
  simulated: boolean;
  error?: string;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM ?? "Keanu Fan <onboarding@resend.dev>";
}

function writeToOutbox(payload: FanEmailPayload): boolean {
  try {
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
    return true;
  } catch {
    // Vercel/serverless filesystem is read-only — outbox is local-dev only.
    return false;
  }
}

function logEmailFailure(to: string, subject: string, reason: string) {
  console.error(`[email] Failed to send "${subject}" to ${to}: ${reason}`);
}

export async function sendFanEmail(payload: FanEmailPayload): Promise<SendFanEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = payload.to.trim().toLowerCase();

  if (!to) {
    return { delivered: false, simulated: true, error: "Missing recipient email." };
  }

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
          to: [to],
          subject: payload.subject,
          text: payload.text,
        }),
      });

      if (response.ok) {
        return { delivered: true, simulated: false };
      }

      let reason = `Resend HTTP ${response.status}`;
      try {
        const body = (await response.json()) as { message?: string; error?: string };
        reason = body.message ?? body.error ?? reason;
      } catch {
        // ignore JSON parse errors
      }

      logEmailFailure(to, payload.subject, reason);
      return { delivered: false, simulated: false, error: reason };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Network error";
      logEmailFailure(to, payload.subject, reason);
      return { delivered: false, simulated: false, error: reason };
    }
  }

  const saved = writeToOutbox({ ...payload, to });
  if (!saved) {
    logEmailFailure(to, payload.subject, "RESEND_API_KEY is not set and local outbox is unavailable.");
  }

  return {
    delivered: false,
    simulated: true,
    error: apiKey ? undefined : "RESEND_API_KEY is not set.",
  };
}

export async function sendFanEmails(
  payloads: FanEmailPayload[]
): Promise<{ delivered: number; simulated: number; failed: number }> {
  let delivered = 0;
  let simulated = 0;
  let failed = 0;

  for (const payload of payloads) {
    const result = await sendFanEmail(payload);
    if (result.delivered) delivered += 1;
    else if (result.simulated) simulated += 1;
    else failed += 1;
  }

  return { delivered, simulated, failed };
}
