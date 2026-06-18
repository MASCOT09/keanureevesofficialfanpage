import type { Metadata } from "next";
import { getDashboardData } from "@/lib/dashboard-data";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardEvents } from "@/components/dashboard/DashboardEvents";

export const metadata: Metadata = {
  title: "Meet & Greet",
  robots: { index: false, follow: false },
};

export default async function DashboardMeetGreetPage() {
  const data = await getDashboardData();
  if (!data) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <DashboardPageHeader
        eyebrow="Events"
        title="Meet & Greet"
        description="Your registered meet & greet events and status."
      />
      <DashboardEvents registrations={data.eventRegistrations} />
    </div>
  );
}
