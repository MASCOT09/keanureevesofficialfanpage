import { cache } from "react";
import { getSiteSettings as getSettings } from "@/lib/excel/repository";
import { mockSiteSettings } from "@/lib/mock-data";

export const getSiteSettings = cache(async () => {
  const settings = await getSettings();
  return settings ?? mockSiteSettings;
});
