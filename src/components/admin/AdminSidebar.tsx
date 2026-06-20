"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/giveaways", label: "Giveaways" },
  { href: "/admin/meet-and-greet", label: "Meet & Greet" },
  { href: "/admin/messages", label: "Fan Messages", badgeKey: "messages" as const },
  { href: "/admin/memberships", label: "Memberships" },
  { href: "/admin/communities", label: "Communities" },
  { href: "/admin/contact-links", label: "Contact Links" },
  { href: "/admin/site-buttons", label: "Button Links" },
  { href: "/admin/settings", label: "Site Settings" },
  { href: "/admin/users", label: "Team & Admins" },
];

export function AdminSidebar({
  className = "",
  onNavigate,
  onClose,
  unreadFanMessages = 0,
}: {
  className?: string;
  onNavigate?: () => void;
  onClose?: () => void;
  unreadFanMessages?: number;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`${className} w-64 shrink-0 flex-col border-r border-border bg-card/95 backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between border-b border-border/60 p-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="text-sm tracking-wide text-accent transition-colors duration-300 hover:text-accent-hover"
        >
          ← Back to site
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted lg:hidden"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`rounded-[12px] px-4 py-2.5 text-sm tracking-wide transition-all duration-300 ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span>{link.label}</span>
                {"badgeKey" in link && link.badgeKey === "messages" && unreadFanMessages > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-on-accent">
                    {unreadFanMessages}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
