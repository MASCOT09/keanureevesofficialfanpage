"use client";

import type { ContactLink } from "@/types/database";
import { openContactChat } from "@/lib/open-contact-chat";

const platformMeta: Record<string, { label: string; icon: string }> = {
  whatsapp: { label: "WhatsApp", icon: "💬" },
  zangi: { label: "Zangi", icon: "📞" },
  telegram: { label: "Telegram", icon: "✈️" },
};

export function TeamContactButtons({ links }: { links: ContactLink[] }) {
  if (!links.length) {
    return (
      <p className="rounded-[12px] border border-dashed border-border/80 px-4 py-3 text-sm text-muted">
        Management contact links are not configured yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => {
        const platform = link.platform.toLowerCase();
        const meta = platformMeta[platform] ?? { label: link.label, icon: "📱" };

        return (
          <button
            key={link.id}
            type="button"
            onClick={() => openContactChat(link)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-5 py-3 text-sm tracking-wide text-foreground transition-all duration-300 hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
          >
            <span aria-hidden>{meta.icon}</span>
            <span>{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
