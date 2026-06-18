import type { Metadata } from "next";
import { getDashboardData } from "@/lib/dashboard-data";
import { getCurrentMembership } from "@/lib/auth";
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome";
import { MembershipPromptBanner } from "@/components/membership/MembershipPromptBanner";
import { NewMemberBanner } from "@/components/dashboard/NewMemberBanner";
import { DashboardOverviewStats } from "@/components/dashboard/overview/DashboardOverviewStats";
import { RecentMessagesSection } from "@/components/dashboard/overview/RecentMessagesSection";
import { UpcomingMeetGreetSection } from "@/components/dashboard/overview/UpcomingMeetGreetSection";
import { ActiveGiveawaysSection } from "@/components/dashboard/overview/ActiveGiveawaysSection";
import { NotificationsPanel } from "@/components/dashboard/overview/NotificationsPanel";
import { ProfileSummary } from "@/components/dashboard/overview/ProfileSummary";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personal fan dashboard — entries, events, and profile.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const data = await getDashboardData();
  if (!data) return null;

  const membership = await getCurrentMembership();
  const params = await searchParams;
  const isNewMember = params.welcome === "1";

  return (
    <div className="mx-auto max-w-7xl space-y-8 lg:space-y-10">
      {isNewMember && <NewMemberBanner firstName={data.firstName} />}
      <MembershipPromptBanner membership={membership} />
      <DashboardWelcome data={data} isNewMember={isNewMember} />
      <DashboardOverviewStats stats={data.stats} />

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-2 lg:space-y-8">
          <RecentMessagesSection messages={data.recentMessages} />
          <UpcomingMeetGreetSection events={data.upcomingEvents} />
          <ActiveGiveawaysSection giveaways={data.activeGiveaways} />
        </div>

        <aside className="space-y-6 lg:space-y-8">
          <NotificationsPanel notifications={data.recentNotifications} />
          <ProfileSummary data={data} />
        </aside>
      </div>
    </div>
  );
}
