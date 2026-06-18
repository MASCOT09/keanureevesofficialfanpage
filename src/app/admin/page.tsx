import Link from "next/link";
import { getAdminStats } from "@/lib/repository";
import { AdminPageHeader, AdminCard } from "@/components/admin/AdminForm";

const controls = [
  {
    href: "/admin/giveaways",
    title: "Giveaways",
    description: "Create prizes fans can enter. Set status to Active so they appear on the site.",
  },
  {
    href: "/admin/meet-and-greet",
    title: "Meet & Greet",
    description: "Add events fans can register for from the public Meet & Greet page.",
  },
  {
    href: "/admin/messages",
    title: "Fan Messages",
    description: "Send inbox messages and optional notifications to one fan or all fans.",
  },
  {
    href: "/admin/communities",
    title: "Communities",
    description: "Manage Telegram and social links shown on the Communities page.",
  },
  {
    href: "/admin/contact-links",
    title: "Contact Links",
    description: "Update WhatsApp, Telegram, and Zangi links on Private DMs.",
  },
  {
    href: "/admin/site-buttons",
    title: "Button Links",
    description: "Control navigation, homepage CTAs, and where guest community clicks go.",
  },
  {
    href: "/admin/settings",
    title: "Site Settings",
    description: "Edit the celebrity name, tagline, and hero video on the homepage.",
  },
  {
    href: "/admin/users",
    title: "Team & Admins",
    description: "Promote trusted fans to admin so they can help manage the site.",
  },
];

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const items = [
    { label: "Giveaways", value: stats.giveawayCount },
    { label: "Meet & Greet Events", value: stats.eventCount },
    { label: "Communities", value: stats.communityCount },
    { label: "Giveaway Entries", value: stats.entryCount },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Admin Dashboard"
        description="You control what fans see on the public site and in their dashboards."
      />

      <div className="mb-10 rounded-[16px] border border-accent/20 bg-accent/5 px-5 py-4 text-sm text-muted">
        <p className="text-foreground">
          <span className="font-medium text-accent">Fan dashboard vs admin:</span> The member portal
          (/dashboard) is what fans see after login. Use this admin area to publish giveaways,
          events, and messages — fans will see them on the public site and in their dashboard inbox.
        </p>
      </div>

      <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((stat) => (
          <AdminCard key={stat.label}>
            <p className="text-sm tracking-wide text-muted">{stat.label}</p>
            <p className="font-display mt-2 text-4xl text-accent">{stat.value}</p>
          </AdminCard>
        ))}
      </div>

      <h2 className="font-display mb-6 text-2xl text-foreground">Manage fan content</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {controls.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="luxury-card group block p-6 transition-all duration-300 hover:border-accent/30"
          >
            <h3 className="font-display mb-2 text-lg text-foreground transition-colors group-hover:text-accent">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
