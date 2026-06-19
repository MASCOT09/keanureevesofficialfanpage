"use client";

import { AdminSubmitButton } from "@/components/admin/AdminForm";
import { formatDashboardDateTime } from "@/lib/dashboard-utils";
import type { Message } from "@/types/messages";

interface MessageThreadChatProps {
  messages: Message[];
  replyAction: (formData: FormData) => void | Promise<void>;
  replyLabel?: string;
  fromNameField?: boolean;
  defaultFromName?: string;
}

export function MessageThreadChat({
  messages,
  replyAction,
  replyLabel = "Send reply",
  fromNameField = false,
  defaultFromName = "Keanu Fan Team",
}: MessageThreadChatProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        {messages.map((message) => {
          const isFan = message.sender_role === "fan";
          return (
            <article
              key={message.id}
              className={`max-w-[85%] rounded-[18px] border px-5 py-4 sm:px-6 sm:py-5 ${
                isFan
                  ? "ml-auto border-accent/20 bg-accent/5"
                  : "mr-auto border-border/80 bg-card/40"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span className="font-medium text-foreground">{message.from_name}</span>
                <span>·</span>
                <span>{formatDashboardDateTime(message.created_at)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{message.body}</p>
            </article>
          );
        })}
      </div>

      <form action={replyAction} className="glass space-y-4 rounded-[18px] border border-border/80 p-6">
        {fromNameField && (
          <div>
            <label htmlFor="from_name" className="mb-2 block text-sm tracking-wide text-muted">
              From name
            </label>
            <input
              id="from_name"
              name="from_name"
              defaultValue={defaultFromName}
              required
              className="w-full rounded-[16px] border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50"
            />
          </div>
        )}
        <div>
          <label htmlFor="body" className="mb-2 block text-sm tracking-wide text-muted">
            Your reply
          </label>
          <textarea
            id="body"
            name="body"
            rows={5}
            required
            placeholder="Write your message..."
            className="w-full rounded-[16px] border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50"
          />
        </div>
        <AdminSubmitButton label={replyLabel} />
      </form>
    </div>
  );
}
