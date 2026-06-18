"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerForEvent } from "@/app/actions/fan-actions";
import type { ContactLink, MeetGreetEvent, MeetGreetRegistration } from "@/types/database";
import { getMembershipLabel } from "@/lib/membership";
import { UpgradeModal } from "@/components/membership/UpgradeModal";

const btnClass =
  "rounded-full bg-accent px-8 py-3.5 text-sm font-medium tracking-wide text-[#0F0F10] transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_32px_rgba(212,175,55,0.3)] disabled:opacity-50";

interface RegisterButtonProps {
  event: MeetGreetEvent;
  registration: MeetGreetRegistration | null;
  confirmedCount: number;
  isLoggedIn: boolean;
  canRegister: boolean;
  teamLinks: ContactLink[];
}

export function RegisterButton({
  event,
  registration,
  confirmedCount,
  isLoggedIn,
  canRegister,
  teamLinks,
}: RegisterButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const isOpen = event.status === "upcoming";
  const spotsLeft = Math.max(0, event.max_spots - confirmedCount);

  const handleRegister = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/meet-and-greet/${event.id}`);
      return;
    }

    if (!canRegister) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);
    setMessage(null);
    const result = await registerForEvent(event.id);

    if (result.error) {
      if (result.upgrade === "gold") {
        setShowUpgrade(true);
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } else {
      const text =
        result.status === "waitlist"
          ? "Added to waitlist. We'll notify you if a spot opens."
          : "You're registered! See you there.";
      setMessage({ type: "success", text });
      router.refresh();
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <p className="glass rounded-[16px] px-5 py-4 text-sm text-muted">
        Registration is closed for this event.
      </p>
    );
  }

  if (registration) {
    return (
      <p
        className={`rounded-[16px] px-5 py-4 text-sm ${
          registration.status === "confirmed"
            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            : "border border-accent/20 bg-accent/10 text-accent"
        }`}
      >
        {registration.status === "confirmed"
          ? "You're confirmed for this event!"
          : "You're on the waitlist."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm tracking-wide text-muted">
        {spotsLeft > 0 ? `${spotsLeft} spots remaining` : "Event full — join waitlist"}
      </p>
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
      <button onClick={handleRegister} disabled={loading} className={btnClass}>
        {loading
          ? "Registering..."
          : isLoggedIn
            ? spotsLeft > 0
              ? "Register Now"
              : "Join Waitlist"
            : "Log in to Register"}
      </button>
      {!isLoggedIn && (
        <p className="text-sm text-muted">
          <Link href="/signup" className="text-accent transition-colors hover:text-accent-hover">
            Create an account
          </Link>{" "}
          to register.
        </p>
      )}
      {isLoggedIn && !canRegister && (
        <p className="text-sm text-muted">
          Meet & greet registration requires Gold or Platinum membership. Contact the management
          team to upgrade.
        </p>
      )}
      <UpgradeModal
        open={showUpgrade}
        title="Gold membership required"
        message="Meet & greet registration is available to Gold and Platinum Members. Silver Members can upgrade to unlock this benefit."
        requiredTierLabel={getMembershipLabel("gold")}
        teamLinks={teamLinks}
        onClose={() => setShowUpgrade(false)}
      />
    </div>
  );
}
