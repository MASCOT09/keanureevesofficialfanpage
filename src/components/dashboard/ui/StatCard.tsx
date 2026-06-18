import type { ReactNode } from "react";

export function StatCard({
  icon,
  label,
  value,
  description,
  delay,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  description: string;
  delay?: string;
}) {
  return (
    <div
      className={`group luxury-card card-shine animate-fade-up p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_12px_40px_rgba(212,175,55,0.08)] sm:p-7 ${delay ?? ""}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent/15">
          {icon}
        </div>
      </div>
      <p className="mb-1 text-xs uppercase tracking-[0.28em] text-muted">{label}</p>
      <p className="font-display mb-2 text-3xl text-foreground sm:text-4xl">{value}</p>
      <p className="text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
