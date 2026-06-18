"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function NewMemberBanner({ firstName }: { firstName: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "1") {
      setVisible(true);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="animate-fade-up rounded-[18px] border border-accent/30 bg-accent/10 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.35em] text-accent">You&apos;re in</p>
          <h2 className="font-display text-lg text-foreground sm:text-xl">
            Welcome to the community, {firstName}! 🎉
          </h2>
          <p className="mt-2 text-sm text-muted">
            Your account is live. Check your inbox for a welcome message and explore giveaways below.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Link
            href="/dashboard/messages"
            className="rounded-full border border-accent/40 bg-accent/15 px-5 py-2.5 text-sm text-accent transition-colors hover:bg-accent/25"
          >
            View message
          </Link>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="rounded-full px-4 py-2.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
