"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { createSession, destroySession } from "@/lib/session";
import {
  createUser,
  findUserByEmail,
  isExcelBackendReady,
  verifyPassword,
} from "@/lib/repository";
import { validateEmail } from "@/lib/validate-email";

export type AuthActionState = {
  error?: string;
  needsSignup?: boolean;
  email?: string;
} | null;

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isExcelBackendReady()) {
    return { error: "Excel database not found. Run: npm run seed" };
  }

  const emailRaw = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirect") as string)?.trim() || "/dashboard";

  if (!emailRaw || !password) {
    return { error: "Email and password are required." };
  }

  const emailCheck = validateEmail(emailRaw);
  if (!emailCheck.valid) {
    return { error: emailCheck.error };
  }

  const user = await findUserByEmail(emailCheck.email);
  if (!user) {
    return {
      error: "No account found with this email.",
      needsSignup: true,
      email: emailCheck.email,
    };
  }

  if (!(await verifyPassword(user, password))) {
    return { error: "Incorrect password. Please try again." };
  }

  await createSession({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  redirect(redirectTo);
}

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isExcelBackendReady()) {
    return { error: "Excel database not found. Run: npm run seed" };
  }

  const displayName = (formData.get("displayName") as string)?.trim();
  const emailRaw = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const country = (formData.get("country") as string)?.trim() || null;

  if (!displayName || !emailRaw || !password) {
    return { error: "All fields are required." };
  }

  const emailCheck = validateEmail(emailRaw);
  if (!emailCheck.valid) {
    return { error: emailCheck.error };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  let user;
  try {
    user = await createUser(emailCheck.email, password, displayName, country);
  } catch (err) {
    if (isRedirectError(err)) throw err;

    const message = err instanceof Error ? err.message : "Signup failed.";
    if (
      message.toLowerCase().includes("could not save") ||
      message.toLowerCase().includes("ebusy")
    ) {
      return {
        error:
          "Could not save your account. Close celebrity-site.xlsx if it is open in Excel, then try again.",
      };
    }
    if (message.toLowerCase().includes("already exists") || message.toLowerCase().includes("duplicate")) {
      return { error: "An account with this email already exists. Try logging in instead." };
    }
    return { error: "We couldn't create your account. Please try again." };
  }

  await createSession({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  revalidatePath("/dashboard");
  redirect("/dashboard?welcome=1");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
