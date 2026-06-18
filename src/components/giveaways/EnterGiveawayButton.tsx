"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { enterGiveaway } from "@/app/actions/fan-actions";
import type { Giveaway } from "@/types/database";

const btnClass =
  "rounded-full bg-accent px-8 py-3.5 text-sm font-medium tracking-wide text-[#0F0F10] transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_32px_rgba(212,175,55,0.3)] disabled:opacity-50";

interface EnterGiveawayButtonProps {
  giveaway: Giveaway;
  hasEntered: boolean;
  isLoggedIn: boolean;
}

export function EnterGiveawayButton({
  giveaway,
  hasEntered,
  isLoggedIn,
}: EnterGiveawayButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const isActive =
    giveaway.status === "active" && new Date(giveaway.ends_at) > new Date();

  const handleEnter = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/giveaways/${giveaway.id}`);
      return;
    }

    setLoading(true);
    setMessage(null);
    const result = await enterGiveaway(giveaway.id);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "You're entered! Good luck!" });
      router.refresh();
    }
    setLoading(false);
  };

  if (!isActive) {
    return (
      <p className="glass rounded-[16px] px-5 py-4 text-sm text-muted">
        This giveaway is closed.
      </p>
    );
  }

  if (hasEntered) {
    return (
      <p className="rounded-[16px] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-400">
        You&apos;re already entered. Good luck!
      </p>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push(`/login?redirect=/giveaways/${giveaway.id}`)}
          className={btnClass}
        >
          Log in to Enter
        </button>
        <p className="text-sm text-muted">
          <Link href="/signup" className="text-accent transition-colors hover:text-accent-hover">
            Create an account
          </Link>{" "}
          to enter giveaways.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <p
          className={`rounded-[16px] px-5 py-4 text-sm ${
            message.type === "success"
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}
      <button onClick={handleEnter} disabled={loading} className={btnClass}>
        {loading ? "Entering..." : "Enter Giveaway"}
      </button>
    </div>
  );
}
