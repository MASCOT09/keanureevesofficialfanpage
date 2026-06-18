export interface ResolvedSiteButton {
  label: string;
  href: string;
  openInNewTab: boolean;
}

export type SiteButtonMap = Record<string, ResolvedSiteButton>;

export function pickSiteButton(map: SiteButtonMap, key: string): ResolvedSiteButton {
  return (
    map[key] ?? {
      label: key,
      href: "/",
      openInNewTab: false,
    }
  );
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
