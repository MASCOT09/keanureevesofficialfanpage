import type { Metadata } from "next";
import Link from "next/link";
import { getFansForMessaging, getMessageThreadsForAdmin, countUnreadFanRepliesForAdmin } from "@/lib/repository";
import { sendAdminMessageAction } from "@/app/actions/admin-actions";
import {
  AdminFormField,
  AdminSelect,
  AdminSubmitButton,
  AdminPageHeader,
  AdminCard,
} from "@/components/admin/AdminForm";
import { FanLastSeenBadge } from "@/components/admin/FanLastSeenBadge";
import { formatDashboardDateTime } from "@/lib/dashboard-utils";
import { getMembershipLabel } from "@/lib/membership";

export const metadata: Metadata = {
  title: "Fan Messages",
  robots: { index: false, follow: false },
};

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const [{ sent, error }, fans, threads, unreadReplies] = await Promise.all([
    searchParams,
    getFansForMessaging(),
    getMessageThreadsForAdmin(),
    countUnreadFanRepliesForAdmin(),
  ]);

  const allThreads = threads;

  return (
    <div>
      <AdminPageHeader
        title="Fan Messages"
        description="Two-way inbox — reply to fan membership requests and send announcements."
      />

      {error && (
        <div className="mb-8 rounded-[16px] border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {decodeURIComponent(error)}
        </div>
      )}

      {sent === "1" && (
        <div className="mb-8 rounded-[16px] border border-accent/30 bg-accent/10 px-5 py-4 text-sm text-foreground">
          Message sent successfully.
        </div>
      )}

      {unreadReplies > 0 && (
        <div className="mb-8 rounded-[16px] border border-accent/30 bg-accent/10 px-5 py-4 text-sm text-foreground">
          <span className="font-medium text-accent">{unreadReplies}</span> unread fan
          {unreadReplies === 1 ? " reply" : " replies"} waiting for your response.
        </div>
      )}

      <AdminCard className="mb-8">
        <h2 className="font-display mb-4 text-xl text-foreground">Fan conversations</h2>
        <p className="mb-6 text-sm text-muted">
          Fans can message you about membership plans. Open a thread to reply, then set their badge
          under Team &amp; Admins.
        </p>

        {!allThreads.length ? (
          <p className="text-sm text-muted">No conversations yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {allThreads.map((thread) => (
              <Link
                key={thread.thread_id}
                href={`/admin/messages/${thread.thread_id}`}
                className={`block rounded-[16px] border p-4 transition-colors hover:border-accent/30 ${
                  thread.unread_for_admin ? "border-accent/30 bg-accent/5" : "border-border/80 bg-card/20"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{thread.fan_name}</p>
                    <p className="text-xs text-muted">{thread.fan_email}</p>
                    <div className="mt-1">
                      <FanLastSeenBadge lastSeenAt={thread.fan_last_seen_at} />
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted">
                    <p>{formatDashboardDateTime(thread.last_message_at)}</p>
                    <p>{getMembershipLabel(thread.membership_tier as "none")}</p>
                  </div>
                </div>
                <p className="mt-3 font-display text-base text-foreground">{thread.subject}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{thread.last_message_preview}</p>
                {thread.unread_for_admin > 0 && (
                  <span className="mt-3 inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                    Needs reply
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </AdminCard>

      <AdminCard className="mb-8">
        <h2 className="font-display mb-2 text-xl text-foreground">Compose message</h2>
        <p className="mb-6 text-sm text-muted">
          Start a new one-way announcement or message a specific fan (creates a new conversation).
        </p>

        <form action={sendAdminMessageAction} className="space-y-4">
          <AdminSelect
            label="Send to"
            name="recipient"
            defaultValue="all"
            options={[
              { value: "all", label: `All fans (${fans.length})` },
              ...fans.map((fan) => ({
                value: fan.id,
                label: `${fan.display_name} (${fan.email})`,
              })),
            ]}
          />
          <AdminFormField
            label="From name"
            name="from_name"
            defaultValue="Keanu Fan Team"
            required
          />
          <AdminFormField label="Subject" name="subject" required />
          <AdminFormField label="Message" name="body" rows={8} required />
          <label className="flex items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              name="also_notify"
              defaultChecked
              className="mt-1 rounded border-border"
            />
            <span>
              Also send a <span className="text-foreground">notification</span> (short alert on the
              fan dashboard bell icon)
            </span>
          </label>
          <AdminSubmitButton label="Send message" pendingLabel="Sending..." />
        </form>
      </AdminCard>
    </div>
  );
}
