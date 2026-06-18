import Link from "next/link";
import { isExternalHref } from "@/lib/site-button-utils";

interface SiteLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  openInNewTab?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SiteLink({
  href,
  openInNewTab = false,
  children,
  className = "",
  ...props
}: SiteLinkProps) {
  const external = openInNewTab || isExternalHref(href);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
