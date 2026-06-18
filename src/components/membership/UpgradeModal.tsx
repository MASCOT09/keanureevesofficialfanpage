"use client";

import type { ContactLink } from "@/types/database";
import { TeamContactButtons } from "@/components/contact/TeamContactButtons";

export function UpgradeModal({
  open,
  title,
  message,
  requiredTierLabel,
  teamLinks,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  requiredTierLabel: string;
  teamLinks: ContactLink[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
      onClick={onClose}
    >
      <div
        className="luxury-card w-full max-w-md p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="mb-2 text-xs uppercase tracking-[0.35em] text-accent">Upgrade required</p>
        <h2 id="upgrade-modal-title" className="font-display text-2xl text-foreground">
          {title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">{message}</p>
        <p className="mt-4 rounded-[12px] border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
          Required level: <strong>{requiredTierLabel}</strong>
        </p>
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-foreground">
            Contact the management team to upgrade your membership.
          </p>
          <TeamContactButtons links={teamLinks} />
        </div>
        <div className="mt-8">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-6 py-3 text-sm text-muted transition-colors hover:text-foreground"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
