"use client";

import type { ContactLink } from "@/types/database";
import { openContactChat } from "@/lib/open-contact-chat";

const platformMeta: Record<string, { label: string; icon: string }> = {
  whatsapp: { label: "WhatsApp", icon: "💬" },
  zangi: { label: "Zangi", icon: "📞" },
  telegram: { label: "Telegram", icon: "✈️" },
};

export function RecipientContactCard({
  title,
  description,
  links,
  locked = false,
  onLockedClick,
}: {
  title: string;
  description: string;
  links: ContactLink[];
  locked?: boolean;
  onLockedClick?: () => void;
}) {
  return (
    <article className={`luxury-card card-shine p-8 ${locked ? "opacity-95" : ""}`}>
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl text-foreground">{title}</h2>
          {locked && (
            <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-accent">
              Locked
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-muted">{description}</p>
      </div>

      {links.length ? (
        <div className="flex flex-wrap gap-3">
          {links.map((link) => {
            const platform = link.platform.toLowerCase();
            const meta = platformMeta[platform] ?? { label: link.label, icon: "📱" };

            return (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  if (locked) {
                    onLockedClick?.();
                    return;
                  }
                  openContactChat(link);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-5 py-3 text-sm tracking-wide text-foreground transition-all duration-300 hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
              >
                <span aria-hidden>{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-[16px] border border-dashed border-border/80 px-5 py-4 text-sm text-muted">
          No messaging apps configured yet.
        </p>
      )}
    </article>
  );
}
