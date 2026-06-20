import { getLastSeenStatus } from "@/lib/dashboard-utils";

export function FanLastSeenBadge({ lastSeenAt }: { lastSeenAt: string | null }) {
  const status = getLastSeenStatus(lastSeenAt);

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs ${
        status.isOnline ? "text-emerald-400" : "text-muted"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          status.isOnline ? "bg-emerald-400" : "bg-muted/60"
        }`}
        aria-hidden
      />
      {status.label}
    </span>
  );
}
