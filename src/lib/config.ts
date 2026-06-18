import { branding } from "./branding";

export const DEMO_VIDEO_URL = "/videos/intro.mp4";

export const DEMO_CELEBRITY = {
  name: branding.celebrityName,
  tagline: branding.tagline,
};

export function isSupabaseConfigured(): boolean {
  return false;
}
