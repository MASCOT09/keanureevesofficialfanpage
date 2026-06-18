import Link from "next/link";

const actions = [
  {
    title: "Enter a Giveaway",
    desc: "Browse active giveaways and win exclusive prizes.",
    href: "/giveaways",
  },
  {
    title: "Register for Events",
    desc: "Secure your spot at upcoming meet & greets.",
    href: "/meet-and-greet",
  },
  {
    title: "Join Communities",
    desc: "Connect with fellow fans on Telegram and more.",
    href: "/communities",
  },
  {
    title: "Private DMs",
    desc: "Reach out via WhatsApp, Zangi, or Telegram.",
    href: "/contact",
  },
];

export function DashboardQuickActions() {
  return (
    <section>
      <div className="mb-6">
        <p className="mb-2 text-xs uppercase tracking-[0.35em] text-accent">Explore</p>
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">Quick Actions</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="luxury-card card-shine group p-6 sm:p-8"
          >
            <div className="mb-4 h-px w-8 bg-accent/60 transition-all duration-300 group-hover:w-12" />
            <h3 className="font-display mb-2 text-lg text-foreground transition-colors duration-300 group-hover:text-accent">
              {action.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted">{action.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
