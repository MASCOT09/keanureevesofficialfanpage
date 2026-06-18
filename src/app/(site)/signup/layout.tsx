import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Create account",
  description:
    "Join the official Keanu Reeves fan community. Sign up for giveaways, meet & greets, and exclusive member access.",
  path: "/signup",
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
