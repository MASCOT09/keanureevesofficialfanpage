"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { formatDashboardDateTime } from "@/lib/dashboard-utils";
import type { Message, MessageSenderRole } from "@/types/messages";

interface MessageThreadChatProps {
  messages: Message[];
  replyAction: (formData: FormData) => void | Promise<void>;
  replyLabel?: string;
  senderRole: MessageSenderRole;
  fromNameField?: boolean;
  defaultFromName?: string;
  senderDisplayName?: string;
}

export function MessageThreadChat({
  messages,
  replyAction,
  replyLabel = "Send reply",
  senderRole,
  fromNameField = false,
  defaultFromName = "Keanu Fan Team",
  senderDisplayName = "Fan",
}: MessageThreadChatProps) {
  const [items, setItems] = useState(messages);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(messages);
    setSending(false);
    setError(null);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = (formData.get("body") as string)?.trim();
    if (!body) return;

    const fromName = fromNameField
      ? (formData.get("from_name") as string)?.trim() || defaultFromName
      : senderDisplayName;

    const base = messages[0];
    if (!base) return;

    const optimisticId = `pending-${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId,
      user_id: base.user_id,
      thread_id: base.thread_id,
      sender_role: senderRole,
      subject: base.subject,
      body,
      from_name: fromName,
      is_read: true,
      status: senderRole === "fan" ? "read" : "unread",
      created_at: new Date().toISOString(),
    };

    setSending(true);
    setError(null);
    setItems((prev) => [...prev, optimistic]);
    form.reset();
    if (fromNameField) {
      const fromInput = form.querySelector<HTMLInputElement>('[name="from_name"]');
      if (fromInput) fromInput.value = defaultFromName;
    }

    startTransition(async () => {
      try {
        const payload = new FormData();
        payload.set("body", body);
        if (fromNameField) payload.set("from_name", fromName);
        await replyAction(payload);
      } catch (err) {
        setSending(false);
        setItems((prev) => prev.filter((message) => message.id !== optimisticId));
        setError(err instanceof Error ? err.message : "Failed to send. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        {items.map((message) => {
          const isFan = message.sender_role === "fan";
          const isPending = message.id.startsWith("pending-");
          return (
            <article
              key={message.id}
              className={`max-w-[85%] rounded-[18px] border px-5 py-4 sm:px-6 sm:py-5 ${
                isFan
                  ? "ml-auto border-accent/20 bg-accent/5"
                  : "mr-auto border-border/80 bg-card/40"
              } ${isPending ? "opacity-80" : ""}`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span className="font-medium text-foreground">{message.from_name}</span>
                <span>·</span>
                <span>{formatDashboardDateTime(message.created_at)}</span>
                {isPending && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
                    Sending…
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{message.body}</p>
            </article>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass space-y-4 rounded-[18px] border border-border/80 p-6"
      >
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
              disabled={sending}
              className="w-full rounded-[16px] border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50 disabled:opacity-60"
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
            disabled={sending}
            placeholder="Write your message..."
            className="w-full rounded-[16px] border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50 disabled:opacity-60"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-accent px-8 py-3 text-sm font-medium tracking-wide text-[#0F0F10] transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_32px_rgba(212,175,55,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Sending…" : replyLabel}
        </button>
      </form>
    </div>
  );
}
