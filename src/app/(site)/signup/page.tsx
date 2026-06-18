"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { signupAction, type AuthActionState } from "@/app/actions/auth-actions";
import { AuthLayout, AuthInput, AuthPasswordInput, AuthError } from "@/components/auth/AuthLayout";
import { SubmitButton } from "@/components/ui/Button";

function SignupForm() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") ?? "";
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signupAction,
    null
  );

  return (
    <AuthLayout
      title="Join the fan community"
      subtitle="Create your account to unlock giveaways, events, and exclusive updates."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-5">
        {state?.error && <AuthError message={state.error} />}
        <AuthInput
          label="Display name"
          id="displayName"
          name="displayName"
          type="text"
          placeholder="Your name"
          required
        />
        <AuthInput
          label="Email"
          id="email"
          name="email"
          type="email"
          defaultValue={emailFromUrl}
          placeholder="you@example.com"
          required
        />
        <AuthInput
          label="Country"
          id="country"
          name="country"
          type="text"
          list="signup-countries"
          placeholder="United States"
        />
        <datalist id="signup-countries">
          <option value="United States" />
          <option value="United Kingdom" />
          <option value="Canada" />
          <option value="Nigeria" />
          <option value="Australia" />
          <option value="Germany" />
          <option value="France" />
          <option value="Japan" />
          <option value="Brazil" />
          <option value="India" />
        </datalist>
        <AuthPasswordInput
          label="Password"
          id="password"
          name="password"
          placeholder="••••••"
          required
          minLength={6}
        />
        <SubmitButton loading={pending}>Create account</SubmitButton>
      </form>
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
