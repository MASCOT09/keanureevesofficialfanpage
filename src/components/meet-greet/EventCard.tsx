import Link from "next/link";
import Image from "next/image";
import type { MeetGreetEvent } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { resolveImageList } from "@/lib/media-upload";

interface EventCardProps {
  event: MeetGreetEvent;
}

export function EventCard({ event }: EventCardProps) {
  const isOpen = event.status === "upcoming";
  const coverImage = resolveImageList(event)[0];

  return (
    <Link
      href={`/meet-and-greet/${event.id}`}
      className="luxury-card card-shine group block overflow-hidden"
    >
      {coverImage && (
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border/60">
          <Image
            src={coverImage}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        </div>
      )}
      <div className="p-8">
      <div className="mb-5 flex items-center justify-between">
        <Badge variant={isOpen ? "active" : "closed"}>
          {isOpen ? "Open" : "Closed"}
        </Badge>
        <span className="text-xs tracking-wide text-muted">{event.max_spots} spots</span>
      </div>
      <h3 className="font-display mb-3 text-xl text-foreground transition-colors duration-300 group-hover:text-accent">
        {event.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted">
        {new Date(event.event_date).toLocaleString()}
        {event.location && ` · ${event.location}`}
      </p>
      <span className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        View details
      </span>
      </div>
    </Link>
  );
}
