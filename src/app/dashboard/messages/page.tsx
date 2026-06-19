import type { Metadata } from "next";
import Link from "next/link";
import { createFanMessageAction } from "@/app/actions/message-actions";
import { getCurrentUser } from "@/lib/auth";
import { getMessageThreadsForUser } from "@/lib/repository";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardEmptyState } from "@/components/dashboard/ui/DashboardEmptyState";
import { AdminFormField, AdminSubmitButton, AdminCard } from "@/components/admin/AdminForm";
import { formatDashboardDateTime } from "@/lib/dashboard-utils";

export const metadata: Metadata = {
  title: "My Messages",
  robots: { index: false, follow: false },
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const [{ new: newTopic }, threads] = await Promise.all([
    searchParams,
    getMessageThreadsForUser(user.id),
  ]);

  const defaultSubject =
    newTopic === "membership" ? "Membership application follow-up" : "";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <DashboardPageHeader
        eyebrow="Inbox"
        title="My Messages"
        description="Two-way conversations with the fan team — ask about membership, upgrades, or anything else."
      />

      <AdminCard>
        <h2 className="font-display mb-2 text-xl text-foreground">Message the team</h2>
        <p className="mb-6 text-sm text-muted">
          No payment on the site yet? Start here to coordinate your Silver, Gold, or Platinum
          membership with the admin team.
        </p>
        <form action={createFanMessageAction} className="space-y-4">
          <AdminFormField
            label="Subject"
            name="subject"
            defaultValue={defaultSubject}
            placeholder="e.g. Silver membership request"
            required
          />
          <AdminFormField
            label="Message"
            name="body"
            rows={6}
            placeholder="Tell the team which plan you want and any details they should know."
            required
          />
          <AdminSubmitButton label="Send message" />
        </form>
      </AdminCard>

      <div>
        <h2 className="font-display mb-4 text-xl text-foreground">Conversations</h2>
        {!threads.length ? (
          <DashboardEmptyState
            icon={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 012-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            title="No conversations yet"
            description="Send a message above or wait for an update from the team."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {threads.map((thread) => (
              <Link
                key={thread.thread_id}
                href={`/dashboard/messages/${thread.thread_id}`}
                className={`glass block rounded-[18px] border p-5 transition-colors hover:border-accent/30 ${
                  thread.unread_for_fan ? "border-accent/25" : "border-border/80"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg text-foreground">{thread.subject}</h3>
                  {thread.unread_for_fan > 0 && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                      New reply
                    </span>
                  )}
                </div>
                <p className="mb-2 line-clamp-2 text-sm text-muted">{thread.last_message_preview}</p>
                <p className="text-xs text-muted">
                  {formatDashboardDateTime(thread.last_message_at)} · {thread.message_count} message
                  {thread.message_count === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
