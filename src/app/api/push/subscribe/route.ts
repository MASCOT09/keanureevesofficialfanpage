import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { deletePushSubscription, isExcelBackendReady, savePushSubscription } from "@/lib/repository";

export async function POST(request: Request) {
  if (!isExcelBackendReady()) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { endpoint?: string; p256dh?: string; auth?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const endpoint = body.endpoint?.trim();
  const p256dh = body.p256dh?.trim();
  const auth = body.auth?.trim();
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Missing subscription fields" }, { status: 400 });
  }

  await savePushSubscription(session.sub, { endpoint, p256dh, auth });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isExcelBackendReady()) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { endpoint?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const endpoint = body.endpoint?.trim();
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  await deletePushSubscription(session.sub, endpoint);
  return NextResponse.json({ ok: true });
}
