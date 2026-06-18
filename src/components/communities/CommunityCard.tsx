import { SiteLink } from "@/components/ui/SiteLink";
import type { Community } from "@/types/database";

const platformIcons: Record<string, string> = {
  telegram: "✈️",
  discord: "💬",
  whatsapp: "📱",
  default: "🌐",
};

interface CommunityCardProps {
  community: Community;
  isLoggedIn: boolean;
  guestJoinHref: string;
  guestJoinLabel: string;
  guestJoinOpenInNewTab?: boolean;
}

export function CommunityCard({
  community,
  isLoggedIn,
  guestJoinHref,
  guestJoinLabel,
  guestJoinOpenInNewTab = false,
}: CommunityCardProps) {
  const icon = platformIcons[community.platform.toLowerCase()] ?? platformIcons.default;
  const cardClassName = "luxury-card card-shine group flex flex-col p-8";

  const body = (
    <>
      <div className="mb-5 flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-border bg-background text-2xl transition-colors duration-300 group-hover:border-accent/30"
          role="img"
          aria-hidden
        >
          {icon}
        </span>
        <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent">
          {community.platform}
        </span>
      </div>
      <h3 className="font-display mb-3 text-xl text-foreground transition-colors duration-300 group-hover:text-accent">
        {community.name}
      </h3>
      {community.description && (
        <p className="mb-6 flex-1 text-sm leading-relaxed text-muted">{community.description}</p>
      )}
      <span className="text-xs uppercase tracking-[0.2em] text-accent">
        {isLoggedIn ? "Join community" : guestJoinLabel}
      </span>
    </>
  );

  if (!isLoggedIn) {
    return (
      <SiteLink href={guestJoinHref} openInNewTab={guestJoinOpenInNewTab} className={cardClassName}>
        {body}
      </SiteLink>
    );
  }

  return (
    <a
      href={community.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClassName}
    >
      {body}
    </a>
  );
}
