import type { Metadata } from "next";
import { branding } from "@/lib/branding";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/\/$/, "")}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

export const defaultOgImage = branding.heroImage;

export const privateRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  robots?: Metadata["robots"];
  type?: "website" | "article";
}

export function buildPageMetadata({
  title,
  description,
  path,
  image = defaultOgImage,
  imageAlt = branding.celebrityName,
  robots,
  type = "website",
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = image?.startsWith("http") ? image : image ? absoluteUrl(image) : absoluteUrl(defaultOgImage);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots,
    openGraph: {
      title,
      description,
      url,
      type,
      siteName: branding.siteTitle,
      locale: "en_US",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: branding.celebrityName,
    url: getSiteUrl(),
    logo: absoluteUrl(defaultOgImage),
    description: branding.tagline,
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${branding.celebrityName} Fan Experience`,
    url: getSiteUrl(),
    description: branding.tagline,
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      name: branding.celebrityName,
    },
  };
}

export function buildWebPageJsonLd({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      url: getSiteUrl(),
      name: `${branding.celebrityName} Fan Experience`,
    },
  };
}

export const indexablePublicPaths = ["/", "/communities", "/login", "/signup"] as const;
