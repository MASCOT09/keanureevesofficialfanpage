import { SiteLayoutWrapper } from "@/components/layout/SiteLayoutWrapper";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayoutWrapper>{children}</SiteLayoutWrapper>;
}
