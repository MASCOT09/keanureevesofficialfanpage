import Link from "next/link";
import { DashboardEmptyState } from "@/components/dashboard/ui/DashboardEmptyState";
import { MessageStatusBadge } from "@/components/dashboard/ui/MessageStatusBadge";
import { formatDashboardDate, getMessagePreview } from "@/lib/dashboard-utils";
import type { Message } from "@/types/messages";

export function RecentMessagesSection({ messages }: { messages: Message[] }) {
  return (
    <section className="glass rounded-[20px] p-6 sm:p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.35em] text-accent">Inbox</p>
          <h2 className="font-display text-xl text-foreground sm:text-2xl">Recent Messages</h2>
        </div>
        {messages.length > 0 && (
          <Link
            href="/dashboard/messages"
            className="shrink-0 text-sm tracking-wide text-muted transition-colors hover:text-accent"
          >
            View All Messages →
          </Link>
        )}
      </div>

      {!messages.length ? (
        <DashboardEmptyState
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          title="No messages yet"
          description="When the fan team sends you updates, they'll appear here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <article
              key={msg.id}
              className="group rounded-[14px] border border-border/60 bg-card/40 p-4 transition-all duration-300 hover:border-accent/25 hover:bg-card/70"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <MessageStatusBadge status={msg.status} />
                <span className="text-xs text-muted">{formatDashboardDate(msg.created_at)}</span>
              </div>
              <h3 className="mb-1.5 font-medium text-foreground transition-colors group-hover:text-accent">
                {msg.subject}
              </h3>
              <p className="line-clamp-2 text-sm text-muted">{getMessagePreview(msg.body)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
