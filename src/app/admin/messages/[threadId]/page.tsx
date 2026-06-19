import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { replyAsAdminThreadAction } from "@/app/actions/admin-actions";
import {
  getMessageThreadsForAdmin,
  getThreadMessagesForAdmin,
  markThreadReadByAdmin,
} from "@/lib/repository";
import { AdminPageHeader } from "@/components/admin/AdminForm";
import { MessageThreadChat } from "@/components/messages/MessageThreadChat";
import { getMembershipLabel } from "@/lib/membership";

export const metadata: Metadata = {
  title: "Conversation",
  robots: { index: false, follow: false },
};

export default async function AdminThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ threadId: string }>;
  searchParams: Promise<{ sent?: string }>;
}) {
  const [{ threadId }, { sent }] = await Promise.all([params, searchParams]);
  const [messages, threads] = await Promise.all([
    getThreadMessagesForAdmin(threadId),
    getMessageThreadsForAdmin(),
  ]);

  if (!messages.length) notFound();

  const thread = threads.find((t) => t.thread_id === threadId);
  await markThreadReadByAdmin(threadId);

  const subject = messages[0].subject;
  const reply = replyAsAdminThreadAction.bind(null, threadId);

  return (
    <div>
      <Link
        href="/admin/messages"
        className="mb-6 inline-flex text-sm tracking-wide text-accent transition-colors hover:text-accent-hover"
      >
        ← Back to fan messages
      </Link>

      <AdminPageHeader
        title={subject}
        description={
          thread
            ? `${thread.fan_name} · ${thread.fan_email} · ${getMembershipLabel(thread.membership_tier as "none")}`
            : undefined
        }
      />

      {thread && (
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/admin/users"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-foreground"
          >
            Set membership badge →
          </Link>
          <Link
            href="/admin/memberships"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-foreground"
          >
            Review applications →
          </Link>
        </div>
      )}

      {sent === "1" && (
        <div className="mb-8 rounded-[16px] border border-accent/30 bg-accent/10 px-5 py-4 text-sm text-foreground">
          Reply sent. The fan will see it in their dashboard inbox.
        </div>
      )}

      <MessageThreadChat
        messages={messages}
        replyAction={reply}
        replyLabel="Send reply"
        fromNameField
        defaultFromName="Keanu Fan Team"
      />
    </div>
  );
}
