"use client";

import Link from "next/link";

const mobileLinks = [
  { href: "/dashboard/giveaways", label: "Giveaways" },
  { href: "/dashboard/contact", label: "Private DMs" },
  { href: "/dashboard/meet-and-greet", label: "Events" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function DashboardMobileNav() {
  return (
    <nav className="glass -mx-6 mb-8 flex gap-1 overflow-x-auto px-4 py-3 lg:hidden">
      {mobileLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="shrink-0 rounded-full border border-border px-4 py-2 text-xs tracking-wide text-muted transition-all duration-300 hover:border-accent/40 hover:text-accent"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
