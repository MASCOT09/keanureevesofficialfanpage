"use client";

import { SiteLink } from "@/components/ui/SiteLink";
import { pickSiteButton, type SiteButtonMap } from "@/lib/site-button-utils";

const publicFooterKeys = ["navbar.home", "navbar.communities"] as const;
const memberFooterKeys = ["navbar.giveaways", "navbar.meet_greet", "navbar.contact"] as const;

function footerItem(map: SiteButtonMap, key: string) {
  const btn = pickSiteButton(map, key);
  return { key, label: btn.label, href: btn.href, openInNewTab: btn.openInNewTab };
}

export function Footer({
  isLoggedIn = false,
  buttons,
}: {
  isLoggedIn?: boolean;
  buttons: SiteButtonMap;
}) {
  const keys = isLoggedIn ? [...publicFooterKeys, ...memberFooterKeys] : publicFooterKeys;
  const footerLinks = keys.map((key) => footerItem(buttons, key));

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
                <li key={link.key}>
                  <SiteLink
                    href={link.href}
                    openInNewTab={link.openInNewTab}
                    className="transition-colors duration-300 hover:text-accent"
                  >
                    {link.label}
                  </SiteLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
