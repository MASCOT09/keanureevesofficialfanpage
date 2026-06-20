import Link from "next/link";

export function AdminControlBanner() {
  return (
    <div className="mb-8 rounded-[18px] border border-accent/25 bg-accent/10 px-5 py-5 sm:px-6">
      <p className="mb-1 text-xs uppercase tracking-[0.3em] text-accent">Admin controls</p>
      <p className="mb-4 max-w-2xl text-sm text-muted">
        You are viewing the <span className="text-foreground">fan dashboard</span> (your personal
        entries and inbox). To <span className="text-foreground">create giveaways, events, and
        messages</span> that all fans will see, use the admin tools below.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/giveaways"
          className="rounded-full border border-accent/40 bg-accent/15 px-5 py-2.5 text-sm font-medium text-accent transition-all hover:bg-accent/25"
        >
          Create giveaways
        </Link>
        <Link
          href="/admin/meet-and-greet"
          className="rounded-full border border-accent/40 bg-accent/15 px-5 py-2.5 text-sm font-medium text-accent transition-all hover:bg-accent/25"
        >
          Create meet & greet events
        </Link>
        <Link
          href="/admin/messages"
          className="rounded-full border border-accent/40 bg-accent/15 px-5 py-2.5 text-sm font-medium text-accent transition-all hover:bg-accent/25"
        >
          Chat with fans
        </Link>
        <Link
          href="/admin"
          className="rounded-full border border-border bg-card/40 px-5 py-2.5 text-sm text-foreground transition-colors hover:border-accent/30 hover:text-accent"
        >
          Admin overview
        </Link>
      </div>
    </div>
  );
}
