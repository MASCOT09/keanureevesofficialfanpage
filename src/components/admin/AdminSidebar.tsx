"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/giveaways", label: "Giveaways" },
  { href: "/admin/meet-and-greet", label: "Meet & Greet" },
  { href: "/admin/messages", label: "Fan Messages" },
  { href: "/admin/memberships", label: "Memberships" },
  { href: "/admin/communities", label: "Communities" },
  { href: "/admin/contact-links", label: "Contact Links" },
  { href: "/admin/site-buttons", label: "Button Links" },
  { href: "/admin/settings", label: "Site Settings" },
  { href: "/admin/users", label: "Team & Admins" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card/80 p-6">
      <Link
        href="/"
        className="mb-10 block text-sm tracking-wide text-accent transition-colors duration-300 hover:text-accent-hover"
      >
        ← Back to site
      </Link>
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-[12px] px-4 py-2.5 text-sm tracking-wide transition-all duration-300 ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
