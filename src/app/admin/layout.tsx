import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { countUnreadFanRepliesForAdmin } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const unreadFanMessages = await countUnreadFanRepliesForAdmin();

  return <AdminShell unreadFanMessages={unreadFanMessages}>{children}</AdminShell>;
}
