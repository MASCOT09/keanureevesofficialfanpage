export function SetupPendingBanner() {
  return (
    <div className="border-b border-border bg-card/60 px-6 py-2.5 text-center text-xs tracking-wide text-muted">
      <span className="text-foreground/80">Node.js setup pending</span>
      {" — "}
      Site code is ready with demo content. When Node finishes installing, open{" "}
      <code className="rounded bg-black/30 px-1.5 py-0.5">docs/NODE_SETUP.md</code> and run{" "}
      <code className="rounded bg-black/30 px-1.5 py-0.5">npm install && npm run dev</code>.
    </div>
  );
}
