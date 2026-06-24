import Link from "next/link";
import Image from "next/image";
import type { Giveaway } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { resolveImageList } from "@/lib/media-upload";

interface GiveawayCardProps {
  giveaway: Giveaway;
}

export function GiveawayCard({ giveaway }: GiveawayCardProps) {
  const isActive =
    giveaway.status === "active" && new Date(giveaway.ends_at) > new Date();
  const coverImage = resolveImageList(giveaway)[0];

  return (
    <Link
      href={`/giveaways/${giveaway.id}`}
      className="luxury-card card-shine group block overflow-hidden"
    >
      {coverImage && (
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border/60">
          <Image
            src={coverImage}
            alt={giveaway.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        </div>
      )}
      <div className="p-8">
      <div className="mb-5 flex items-center justify-between">
        <Badge variant={isActive ? "active" : "closed"}>
          {isActive ? "Active" : "Closed"}
        </Badge>
        <span className="text-xs tracking-wide text-muted">
          Ends {new Date(giveaway.ends_at).toLocaleDateString()}
        </span>
      </div>
      <h3 className="font-display mb-3 text-xl text-foreground transition-colors duration-300 group-hover:text-accent">
        {giveaway.title}
      </h3>
      {giveaway.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{giveaway.description}</p>
      )}
      <span className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        View details
      </span>
      </div>
    </Link>
  );
}
