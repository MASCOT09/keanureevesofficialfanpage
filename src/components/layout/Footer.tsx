"use client";

import Link from "next/link";

const publicFooterLinks = [
  { href: "/", label: "Home" },
  { href: "/communities", label: "Communities" },
];

const memberFooterLinks = [
  { href: "/giveaways", label: "Giveaways" },
  { href: "/meet-and-greet", label: "Meet & Greet" },
  { href: "/contact", label: "Private DMs" },
];

export function Footer({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const footerLinks = isLoggedIn
    ? [...publicFooterLinks, ...memberFooterLinks]
    : publicFooterLinks;

  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-10 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="font-display text-xl text-foreground">Keanu Reeves</p>
            <p className="mt-2 text-sm tracking-wide text-muted">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-8 text-sm tracking-wide text-muted">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors duration-300 hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
