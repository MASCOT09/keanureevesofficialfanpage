import type { Metadata } from "next";
import { getDashboardData } from "@/lib/dashboard-data";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardGiveaways } from "@/components/dashboard/DashboardGiveaways";

export const metadata: Metadata = {
  title: "Giveaways",
  robots: { index: false, follow: false },
};

export default async function DashboardGiveawaysPage() {
  const data = await getDashboardData();
  if (!data) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <DashboardPageHeader
        eyebrow="Giveaways"
        title="My Giveaways"
        description="Track your active and past giveaway entries."
      />
      <DashboardGiveaways entries={data.giveawayEntries} />
    </div>
  );
}
