"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDashboardDateTime } from "@/lib/dashboard-utils";
import { MembershipPaymentOptions } from "@/components/messages/MembershipPaymentOptions";
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

function parsePaymentMetadata(metadata: string | null) {
  if (!metadata) return null;
  try {
    const data = JSON.parse(metadata) as { planName?: string; amount?: number };
    if (!data.planName || typeof data.amount !== "number") return null;
    return { planName: data.planName, amount: data.amount };
  } catch {
    return null;
  }
}

function MessageContent({ message }: { message: Message }) {
  const payment = parsePaymentMetadata(message.metadata);

  return (
    <>
      {message.body && message.body !== "(Image)" && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{message.body}</p>
      )}
      {message.message_kind === "payment_options" && payment && (
        <MembershipPaymentOptions planName={payment.planName} amount={payment.amount} />
      )}
      {message.image_url && (
        <div className="mt-3 overflow-hidden rounded-[12px] border border-border/60">
          <a href={message.image_url} target="_blank" rel="noopener noreferrer">
            <img
              src={message.image_url}
              alt="Attached image"
              className="max-h-80 w-full object-contain bg-black/20"
            />
          </a>
        </div>
      )}
    </>
  );
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
  const router = useRouter();
  const [items, setItems] = useState(messages);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(messages);
    setSending(false);
    setError(null);
    setImagePreview(null);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setImagePreview(null);
      return;
    }
    setImagePreview(URL.createObjectURL(file));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = (formData.get("body") as string)?.trim();
    const imageFile = formData.get("image") as File | null;
    const hasImage = imageFile && imageFile.size > 0;
    if (!body && !hasImage) return;

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
      body: body || "(Image)",
      from_name: fromName,
      is_read: true,
      status: senderRole === "fan" ? "read" : "unread",
      created_at: new Date().toISOString(),
      image_url: imagePreview,
      message_kind: "text",
      metadata: null,
    };

    setSending(true);
    setError(null);
    setItems((prev) => [...prev, optimistic]);
    form.reset();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (fromNameField) {
      const fromInput = form.querySelector<HTMLInputElement>('[name="from_name"]');
      if (fromInput) fromInput.value = defaultFromName;
    }

    startTransition(async () => {
      try {
        const payload = new FormData();
        if (body) payload.set("body", body);
        if (fromNameField) payload.set("from_name", fromName);
        if (hasImage && imageFile) payload.set("image", imageFile);
        await replyAction(payload);
        setSending(false);
        router.refresh();
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
              <MessageContent message={message} />
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
            disabled={sending}
            placeholder="Write your message..."
            className="w-full rounded-[16px] border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50 disabled:opacity-60"
          />
        </div>
        <div>
          <label htmlFor="image" className="mb-2 block text-sm tracking-wide text-muted">
            Attach image (optional)
          </label>
          <input
            ref={fileInputRef}
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={sending}
            onChange={handleImageChange}
            className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accent/15 file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent"
          />
          {imagePreview && (
            <div className="mt-3 overflow-hidden rounded-[12px] border border-border/60">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 w-full object-contain bg-black/20"
              />
            </div>
          )}
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
