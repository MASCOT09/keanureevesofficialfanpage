import { cache } from "react";
import { getAllSiteButtons } from "@/lib/repository";
import { SITE_BUTTON_DEFAULTS } from "@/lib/site-button-defaults";

export interface ResolvedSiteButton {
  label: string;
  href: string;
  openInNewTab: boolean;
}

export type SiteButtonMap = Record<string, ResolvedSiteButton>;

function defaultsToMap(): SiteButtonMap {
  const map: SiteButtonMap = {};
  for (const row of SITE_BUTTON_DEFAULTS) {
    map[row.button_key] = {
      label: row.label,
      href: row.href,
      openInNewTab: row.open_in_new_tab,
    };
  }
  return map;
}

export const getSiteButtonMap = cache(async (): Promise<SiteButtonMap> => {
  const map = defaultsToMap();
  try {
    const rows = await getAllSiteButtons();
    for (const row of rows) {
      if (row.is_active) {
        map[row.button_key] = {
          label: row.label,
          href: row.href,
          openInNewTab: row.open_in_new_tab,
        };
      }
    }
  } catch {
    // Fall back to defaults if DB unavailable
  }
  return map;
});

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
