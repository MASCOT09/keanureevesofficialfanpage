interface BadgeProps {
  children: React.ReactNode;
  variant?: "active" | "closed" | "waitlist" | "default";
}

const styles = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed: "bg-white/5 text-muted border-border",
  waitlist: "bg-accent/10 text-accent border-accent/25",
  default: "bg-accent/10 text-accent border-accent/20",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium tracking-wide ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
