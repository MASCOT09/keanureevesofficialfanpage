import { SiteLayoutWrapper } from "@/components/layout/SiteLayoutWrapper";

export default function MeetGreetLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayoutWrapper>{children}</SiteLayoutWrapper>;
}
