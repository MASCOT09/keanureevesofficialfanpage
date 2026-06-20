import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardShell } from "@/lib/dashboard-data";
import { getMembershipLabel } from "@/lib/membership";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getDashboardShell();

  if (!data) {
    redirect("/login?redirect=/dashboard");
  }

  const user = {
    id: data.profile.id,
    email: data.email,
    displayName: data.profile.display_name ?? "Fan",
    firstName: data.firstName,
    role: data.profile.role,
    memberSince: data.memberSince,
    unreadNotifications: data.unreadNotifications,
    unreadMessages: data.unreadMessages,
    unreadFanReplies: data.unreadFanReplies,
    avatarUrl: data.profile.avatar_url,
    membershipTier: data.profile.membership_tier,
    membershipLabel:
      data.profile.role === "admin"
        ? "Admin"
        : getMembershipLabel(data.profile.membership_tier),
  };

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
