import type { Metadata } from "next";
import { HomeContent } from "@/components/home/HomeContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteButtonMap } from "@/lib/site-buttons";
import { branding } from "@/lib/branding";
import { DEMO_VIDEO_URL } from "@/lib/config";
import { getSession } from "@/lib/session";
import {
  buildOrganizationJsonLd,
  buildPageMetadata,
  buildWebSiteJsonLd,
} from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = settings?.celebrity_name ?? branding.celebrityName;
  const tagline = settings?.tagline ?? branding.tagline;

  return buildPageMetadata({
    title: name,
    description: tagline,
    path: "/",
  });
}

export default async function HomePage() {
  const [settings, session, buttons] = await Promise.all([
    getSiteSettings(),
    getSession(),
    getSiteButtonMap(),
  ]);

  return (
    <>
      <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
      <HomeContent
        celebrityName={settings?.celebrity_name ?? branding.celebrityName}
        tagline={settings?.tagline ?? branding.tagline}
        heroVideoUrl={settings?.hero_video_url ?? DEMO_VIDEO_URL}
        isLoggedIn={!!session}
        buttons={buttons}
      />
    </>
  );
}
