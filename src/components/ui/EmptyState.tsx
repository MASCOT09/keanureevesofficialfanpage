interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="glass rounded-[20px] px-8 py-20 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card">
        <span className="text-accent">—</span>
      </div>
      <h3 className="font-display mb-3 text-xl text-foreground">{title}</h3>
      <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-8 flex justify-center">{action}</div>}
    </div>
  );
}
