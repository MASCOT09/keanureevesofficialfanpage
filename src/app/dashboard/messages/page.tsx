import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getMessagesForUser } from "@/lib/excel/repository";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardEmptyState } from "@/components/dashboard/ui/DashboardEmptyState";
import { MessageStatusBadge } from "@/components/dashboard/ui/MessageStatusBadge";
import { formatDashboardDateTime } from "@/lib/dashboard-utils";

export const metadata: Metadata = {
  title: "My Messages",
  robots: { index: false, follow: false },
};

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const messages = await getMessagesForUser(user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <DashboardPageHeader
        eyebrow="Inbox"
        title="My Messages"
        description="Messages from the fan team and official updates."
      />

      {!messages.length ? (
        <DashboardEmptyState
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          title="No messages yet"
          description="When you receive messages, they'll appear here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <article
              key={msg.id}
              className={`glass rounded-[18px] p-6 sm:p-8 ${msg.status === "unread" ? "border-accent/20" : ""}`}
            >
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <MessageStatusBadge status={msg.status} />
                <span className="text-xs text-muted">{formatDashboardDateTime(msg.created_at)}</span>
                <span className="text-xs text-muted">· From {msg.from_name}</span>
              </div>
              <h2 className="font-display mb-3 text-xl text-foreground">{msg.subject}</h2>
              <p className="text-sm leading-relaxed text-muted">{msg.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
