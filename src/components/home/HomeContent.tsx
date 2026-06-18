import Link from "next/link";
import { WelcomeHero } from "@/components/home/WelcomeHero";
import { Button } from "@/components/ui/Button";

interface HomeContentProps {
  celebrityName: string;
  tagline: string;
  heroVideoUrl: string;
  isLoggedIn: boolean;
}

const features = [
  {
    title: "Giveaways",
    desc: "Win exclusive merch, signed items, and VIP access.",
    href: "/giveaways",
  },
  {
    title: "Meet & Greet",
    desc: "Register for upcoming events and connect in person.",
    href: "/meet-and-greet",
  },
  {
    title: "Communities",
    desc: "Join fan groups on Telegram and beyond.",
    href: "/communities",
  },
  {
    title: "Private DMs",
    desc: "Reach out via WhatsApp, Zangi, or Telegram.",
    href: "/contact",
  },
];

export function HomeContent({ heroVideoUrl, isLoggedIn }: HomeContentProps) {
  const visibleFeatures = isLoggedIn
    ? features
    : features.filter((item) => item.href === "/communities");

  const stats = isLoggedIn
    ? [
        { label: "Giveaways", value: "Live" },
        { label: "Events", value: "Upcoming" },
        { label: "Communities", value: "Join" },
        { label: "Direct Access", value: "DMs" },
      ]
    : [{ label: "Communities", value: "Join" }];

  return (
    <>
      <WelcomeHero heroVideoUrl={heroVideoUrl} />

      {/* Stats strip */}
      <section className="border-y border-border/60 bg-card/40">
        <div
          className={`mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:px-10 ${
            isLoggedIn ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:max-w-xs"
          }`}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-2xl text-accent">{stat.value}</p>
              <p className="mt-2 text-sm tracking-wide text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.4em] text-accent">Explore</p>
          <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
            Everything in one place
          </h2>
        </div>
        <div className={`grid gap-6 ${isLoggedIn ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-1 lg:max-w-md lg:mx-auto"}`}>
          {visibleFeatures.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="luxury-card card-shine group p-8"
            >
              <div className="mb-6 h-px w-8 bg-accent/60 transition-all duration-300 group-hover:w-12" />
              <h3 className="font-display mb-3 text-xl text-foreground transition-colors group-hover:text-accent">
                {item.title}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-muted">{item.desc}</p>
              <span className="text-xs uppercase tracking-[0.2em] text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Explore
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-28 lg:px-10">
        <div className="glass relative overflow-hidden rounded-[20px] px-8 py-20 text-center sm:px-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
          <h2 className="font-display relative mb-5 text-3xl text-foreground sm:text-4xl">
            {isLoggedIn ? "Welcome back" : "Join the community"}
          </h2>
          <p className="relative mx-auto mb-10 max-w-lg text-muted">
            {isLoggedIn
              ? "Head to your dashboard for giveaways, meet & greets, messages, and private DMs."
              : "Create your fan account to enter giveaways, register for meet & greets, and stay connected with exclusive updates."}
          </p>
          <div className="relative flex flex-wrap justify-center gap-4">
            {isLoggedIn ? (
              <>
                <Button href="/dashboard">Go to Dashboard</Button>
                <Button href="/communities" variant="secondary">
                  Browse Communities
                </Button>
              </>
            ) : (
              <>
                <Button href="/signup">Create Account</Button>
                <Button href="/communities" variant="secondary">
                  Browse Communities
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
