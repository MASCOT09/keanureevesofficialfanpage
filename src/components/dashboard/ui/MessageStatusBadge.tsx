import type { MessageStatus } from "@/types/messages";
import { getMessageStatusLabel } from "@/lib/dashboard-utils";

const styles: Record<MessageStatus, string> = {
  unread: "bg-accent/15 text-accent border-accent/25",
  read: "bg-white/5 text-muted border-border",
  replied: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export function MessageStatusBadge({ status }: { status: MessageStatus }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${styles[status]}`}
    >
      {getMessageStatusLabel(status)}
    </span>
  );
}
