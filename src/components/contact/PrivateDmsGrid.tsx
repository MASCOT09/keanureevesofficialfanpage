import type { ContactLink } from "@/types/database";
import { groupContactLinksByRecipient, pickContactLinkPerPlatform } from "@/lib/contact-dms";
import { RecipientContactCard } from "@/components/contact/RecipientContactCard";

export function PrivateDmsGrid({ links }: { links: ContactLink[] }) {
  const sections = groupContactLinksByRecipient(links);

  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => (
        <RecipientContactCard
          key={section.id}
          title={section.title}
          description={section.description}
          links={pickContactLinkPerPlatform(section.links)}
        />
      ))}
    </div>
  );
}
