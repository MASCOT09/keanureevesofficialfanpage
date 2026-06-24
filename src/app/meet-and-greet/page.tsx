import type { Metadata } from "next";
import { getMeetGreetEvents } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventCard } from "@/components/meet-greet/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Meet & Greet",
  description: "Official meet and greet events. Anyone can browse — sign in to register.",
  path: "/meet-and-greet",
});

export const revalidate = 60;

export default async function MeetAndGreetPage() {
  const events = await getMeetGreetEvents();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:px-10">
      <PageHeader
        eyebrow="Connect"
        title="Meet & Greet"
        description="Browse upcoming events and connect in person. Sign in to register — spots are limited."
      />

      {!events.length ? (
        <EmptyState
          title="No upcoming events"
          description="New meet & greet dates will be announced soon."
        />
      ) : (
        <section aria-label="Upcoming meet and greet events">
          <ul className="grid list-none gap-6 sm:grid-cols-2">
            {events.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
