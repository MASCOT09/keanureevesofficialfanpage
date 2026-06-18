import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "fan_session";

export interface SessionPayload {
  sub: string;
  email: string;
  role: "fan" | "admin";
}

function getSecret() {
  const secret = process.env.SESSION_SECRET ?? "dev-only-change-this-secret-key";
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    const email = payload.email;
    const role = payload.role;

    if (typeof sub !== "string" || typeof email !== "string") return null;
    if (role !== "fan" && role !== "admin") return null;

    return { sub, email, role };
  } catch {
    return null;
  }
}

export async function getSessionFromToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    const email = payload.email;
    const role = payload.role;

    if (typeof sub !== "string" || typeof email !== "string") return null;
    if (role !== "fan" && role !== "admin") return null;

    return { sub, email, role };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
