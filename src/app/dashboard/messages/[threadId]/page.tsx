import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { replyAsFanAction } from "@/app/actions/message-actions";
import { getCurrentUser } from "@/lib/auth";
import { getThreadMessages, markThreadReadByFan } from "@/lib/repository";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { MessageThreadChat } from "@/components/messages/MessageThreadChat";

export const metadata: Metadata = {
  title: "Conversation",
  robots: { index: false, follow: false },
};

export default async function FanThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ threadId: string }>;
  searchParams: Promise<{ sent?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const [{ threadId }, { sent }] = await Promise.all([params, searchParams]);

  if (user.role === "admin") {
    redirect(`/admin/messages/${threadId}`);
  }

  const messages = await getThreadMessages(threadId, user.id);
  if (!messages.length) notFound();

  await markThreadReadByFan(threadId, user.id);

  const subject = messages[0].subject;
  const reply = replyAsFanAction.bind(null, threadId);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        href="/dashboard/messages"
        className="inline-flex text-sm tracking-wide text-accent transition-colors hover:text-accent-hover"
      >
        ← Back to messages
      </Link>

      <DashboardPageHeader eyebrow="Conversation" title={subject} />

      {sent === "1" && (
        <div className="rounded-[16px] border border-accent/30 bg-accent/10 px-5 py-4 text-sm text-foreground">
          Your reply was sent. The team will respond here.
        </div>
      )}

      <MessageThreadChat messages={messages} replyAction={reply} replyLabel="Send reply" />
    </div>
  );
}
