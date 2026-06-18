import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGiveawayById } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { hasGiveawayEntry } from "@/lib/repository";
import { EnterGiveawayButton } from "@/components/giveaways/EnterGiveawayButton";
import { Badge } from "@/components/ui/Badge";

import { buildPageMetadata, privateRobots } from "@/lib/seo";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const giveaway = await getGiveawayById(id);
  const title = giveaway?.title ?? "Giveaway";
  const description = giveaway?.description ?? "Member-only giveaway details.";

  return buildPageMetadata({
    title,
    description,
    path: `/giveaways/${id}`,
    image: giveaway?.image_url ?? undefined,
    imageAlt: giveaway?.title,
    robots: privateRobots,
  });
}

export default async function GiveawayDetailPage({ params }: Props) {
  const { id } = await params;
  const giveaway = await getGiveawayById(id);

  if (!giveaway) notFound();

  const user = await getCurrentUser();
  const isLoggedIn = !!user;
  const hasEntered = user ? await hasGiveawayEntry(user.id, id) : false;

  const isActive =
    giveaway.status === "active" && new Date(giveaway.ends_at) > new Date();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20 lg:px-10">
      <Link
        href="/giveaways"
        className="mb-10 inline-flex items-center gap-2 text-sm tracking-wide text-muted transition-colors duration-300 hover:text-accent"
      >
        ← Back to giveaways
      </Link>

      <div className="luxury-card card-shine mb-8 overflow-hidden">
        {giveaway.image_url && (
          <div className="relative aspect-[21/9] w-full border-b border-border/60">
            <Image
              src={giveaway.image_url}
              alt={giveaway.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
              unoptimized
            />
          </div>
        )}
        <div className="p-8 sm:p-10">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Badge variant={isActive ? "active" : "closed"}>
            {isActive ? "Active" : "Closed"}
          </Badge>
          <span className="text-sm tracking-wide text-muted">
            Ends {new Date(giveaway.ends_at).toLocaleString()}
          </span>
        </div>

        <h1 className="font-display mb-5 text-3xl text-foreground sm:text-4xl">{giveaway.title}</h1>

        {giveaway.description && (
          <p className="text-lg leading-relaxed text-muted">{giveaway.description}</p>
        )}
        </div>
      </div>

      {giveaway.rules && (
        <div className="glass mb-10 rounded-[20px] p-8">
          <h2 className="font-display mb-4 text-xl text-foreground">Rules</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{giveaway.rules}</p>
        </div>
      )}

      <EnterGiveawayButton
        giveaway={giveaway}
        hasEntered={hasEntered}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
