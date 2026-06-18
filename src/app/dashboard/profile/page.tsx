import type { Metadata } from "next";
import { getDashboardData } from "@/lib/dashboard-data";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardProfile } from "@/components/dashboard/DashboardProfile";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const data = await getDashboardData();
  if (!data) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <DashboardPageHeader
        eyebrow="Account"
        title="Profile"
        description="Your member information and display preferences."
      />
      <DashboardProfile data={data} hideTitle />
    </div>
  );
}
