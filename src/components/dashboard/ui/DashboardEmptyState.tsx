import type { ReactNode } from "react";

export function DashboardEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[18px] border border-dashed border-border/80 bg-card/30 px-6 py-14 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/20 bg-accent/5 text-accent">
        {icon}
      </div>
      <h3 className="font-display mb-2 text-lg text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {action}
    </div>
  );
}
