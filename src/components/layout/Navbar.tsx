"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteLink } from "@/components/ui/SiteLink";
import { pickSiteButton, type SiteButtonMap } from "@/lib/site-button-utils";

export interface NavbarUser {
  id: string;
  email: string;
  role: string;
  display_name: string;
}

const publicNavKeys = ["navbar.home", "navbar.communities"] as const;
const memberNavKeys = ["navbar.giveaways", "navbar.meet_greet", "navbar.contact"] as const;

function navItem(map: SiteButtonMap, key: string) {
  const btn = pickSiteButton(map, key);
  return { key, label: btn.label, href: btn.href, openInNewTab: btn.openInNewTab };
}

export function Navbar({
  initialUser = null,
  buttons,
}: {
  initialUser?: NavbarUser | null;
  buttons: SiteButtonMap;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<NavbarUser | null>(initialUser);
  const [authReady, setAuthReady] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setUser(initialUser);
    setAuthReady(true);
  }, [initialUser]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    const { logoutAction } = await import("@/app/actions/auth-actions");
    await logoutAction();
  };

  const isAdmin = user?.role === "admin";
  const home = navItem(buttons, "navbar.home");
  const navLinks = user
    ? [...publicNavKeys, ...memberNavKeys].map((key) => navItem(buttons, key))
    : publicNavKeys.map((key) => navItem(buttons, key));
  const login = navItem(buttons, "navbar.login");
  const signup = navItem(buttons, "navbar.signup");
  const dashboard = navItem(buttons, "navbar.dashboard");
  const admin = navItem(buttons, "navbar.admin");

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass border-b border-border/80 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <SiteLink href={home.href} openInNewTab={home.openInNewTab} className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/30 bg-accent/5 font-display text-sm text-accent transition-all duration-300 group-hover:border-accent group-hover:bg-accent/10">
            KR
          </span>
          <span className="font-display text-lg tracking-wide text-foreground transition-colors duration-300 group-hover:text-accent">
            Keanu Reeves
          </span>
        </SiteLink>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <SiteLink
                key={link.key}
                href={link.href}
                openInNewTab={link.openInNewTab}
                className={`relative px-4 py-2 text-sm tracking-wide transition-colors duration-300 ${
                  active ? "text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 h-px w-6 -translate-x-1/2 bg-accent" />
                )}
              </SiteLink>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {authReady && isAdmin && (
            <SiteLink
              href={admin.href}
              openInNewTab={admin.openInNewTab}
              className="text-sm tracking-wide text-muted transition-colors duration-300 hover:text-accent"
            >
              {admin.label}
            </SiteLink>
          )}
          {authReady &&
            (user ? (
              <>
                <SiteLink
                  href={dashboard.href}
                  openInNewTab={dashboard.openInNewTab}
                  className={`text-sm tracking-wide transition-colors duration-300 ${
                    pathname.startsWith("/dashboard")
                      ? "text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {dashboard.label}
                </SiteLink>
                <button
                  onClick={handleSignOut}
                  className="rounded-full border border-border px-5 py-2 text-sm tracking-wide text-muted transition-all duration-300 hover:border-accent/40 hover:text-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <SiteLink
                  href={login.href}
                  openInNewTab={login.openInNewTab}
                  className="text-sm tracking-wide text-muted transition-colors duration-300 hover:text-foreground"
                >
                  {login.label}
                </SiteLink>
                <SiteLink
                  href={signup.href}
                  openInNewTab={signup.openInNewTab}
                  className="rounded-full bg-accent px-5 py-2 text-sm font-medium tracking-wide text-on-accent transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(212,175,55,0.3)]"
                >
                  {signup.label}
                </SiteLink>
              </>
            ))}
        </div>

        <button
          className="rounded-lg p-2 text-muted md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="glass border-t border-border px-6 py-6 md:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <SiteLink
                key={link.key}
                href={link.href}
                openInNewTab={link.openInNewTab}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm tracking-wide transition-colors ${
                  isActive(link.href)
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {link.label}
              </SiteLink>
            ))}
            <div className="my-3 h-px bg-border" />
            {authReady && isAdmin && (
              <SiteLink
                href={admin.href}
                openInNewTab={admin.openInNewTab}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm text-muted"
              >
                {admin.label}
              </SiteLink>
            )}
            {authReady && (user ? (
              <>
                <SiteLink
                  href={dashboard.href}
                  openInNewTab={dashboard.openInNewTab}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 text-sm ${
                    pathname.startsWith("/dashboard") ? "text-accent" : "text-muted"
                  }`}
                >
                  {dashboard.label}
                </SiteLink>
                <button onClick={handleSignOut} className="px-4 py-3 text-left text-sm text-muted">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <SiteLink
                  href={login.href}
                  openInNewTab={login.openInNewTab}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm text-muted"
                >
                  {login.label}
                </SiteLink>
                <SiteLink
                  href={signup.href}
                  openInNewTab={signup.openInNewTab}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm text-accent"
                >
                  {signup.label}
                </SiteLink>
              </>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
