"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { loginAction, type AuthActionState } from "@/app/actions/auth-actions";
import { AuthLayout, AuthInput, AuthPasswordInput, AuthError } from "@/components/auth/AuthLayout";
import { SubmitButton } from "@/components/ui/Button";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    loginAction,
    null
  );

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to enter giveaways and register for events."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="redirect" value={redirectTo} />
        {state?.error && <AuthError message={state.error} />}
        {state?.needsSignup && state.email && (
          <p className="rounded-[16px] border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-muted">
            New here?{" "}
            <Link
              href={`/signup?email=${encodeURIComponent(state.email)}`}
              className="font-medium text-accent hover:underline"
            >
              Create an account with {state.email}
            </Link>
          </p>
        )}
        <AuthInput
          label="Email"
          id="email"
          name="email"
          type="email"
          defaultValue={state?.email ?? ""}
          placeholder="fan@example.com"
          required
        />
        <AuthPasswordInput
          label="Password"
          id="password"
          name="password"
          placeholder="••••••"
          required
        />
        <SubmitButton loading={pending}>Sign in</SubmitButton>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
