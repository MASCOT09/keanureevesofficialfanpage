import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeetGreetEventById } from "@/lib/data";
import { getCurrentMembership, getCurrentUser } from "@/lib/auth";
import {
  countConfirmedRegistrations,
  getContactLinks,
  getRegistrationForUser,
} from "@/lib/excel/repository";
import { getTeamContactLinks } from "@/lib/contact-dms";
import { canRegisterMeetAndGreet } from "@/lib/membership";
import { RegisterButton } from "@/components/meet-greet/RegisterButton";
import { Badge } from "@/components/ui/Badge";

import { buildPageMetadata, privateRobots } from "@/lib/seo";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getMeetGreetEventById(id);
  const title = event?.title ?? "Meet & Greet";
  const description = event?.description ?? "Member-only meet and greet event details.";

  return buildPageMetadata({
    title,
    description,
    path: `/meet-and-greet/${id}`,
    robots: privateRobots,
  });
}

export default async function MeetGreetDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getMeetGreetEventById(id);

  if (!event) notFound();

  const user = await getCurrentUser();
  const membership = await getCurrentMembership();
  const contactLinks = await getContactLinks();
  const teamLinks = getTeamContactLinks(contactLinks);
  const isLoggedIn = !!user;
  const canRegister = canRegisterMeetAndGreet(membership, membership.isAdmin);
  const registration = user ? await getRegistrationForUser(user.id, id) : null;
  const confirmedCount = await countConfirmedRegistrations(id);

  const isOpen = event.status === "upcoming";

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20 lg:px-10">
      <Link
        href="/meet-and-greet"
        className="mb-10 inline-flex items-center gap-2 text-sm tracking-wide text-muted transition-colors duration-300 hover:text-accent"
      >
        ← Back to events
      </Link>

      <div className="luxury-card card-shine mb-10 p-8 sm:p-10">
        <div className="mb-5">
          <Badge variant={isOpen ? "active" : "closed"}>
            {isOpen ? "Open for registration" : "Closed"}
          </Badge>
        </div>

        <h1 className="font-display mb-6 text-3xl text-foreground sm:text-4xl">{event.title}</h1>

        <div className="space-y-2 text-muted">
          <p>{new Date(event.event_date).toLocaleString()}</p>
          {event.location && <p>{event.location}</p>}
          <p>{event.max_spots} total spots</p>
        </div>

        {event.description && (
          <p className="mt-6 text-lg leading-relaxed text-muted">{event.description}</p>
        )}
      </div>

      <RegisterButton
        event={event}
        registration={registration}
        confirmedCount={confirmedCount}
        isLoggedIn={isLoggedIn}
        canRegister={canRegister}
        teamLinks={teamLinks}
      />
    </div>
  );
}
