import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SetupBanners } from "@/components/ui/SetupBanners";
import { branding } from "@/lib/branding";
import { buildPageMetadata, getSiteUrl } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  ...buildPageMetadata({
    title: branding.siteTitle,
    description: branding.tagline,
    path: "/",
  }),
  title: {
    default: branding.siteTitle,
    template: `%s | ${branding.siteTitle}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SetupBanners />
        {children}
      </body>
    </html>
  );
}
