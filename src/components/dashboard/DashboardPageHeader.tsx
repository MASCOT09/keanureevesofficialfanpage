export function DashboardPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="animate-fade-up border-b border-border/60 pb-8">
      <p className="mb-2 text-xs uppercase tracking-[0.4em] text-accent">{eyebrow}</p>
      <h1 className="font-display mb-3 text-2xl text-foreground sm:text-3xl">{title}</h1>
      {description && (
        <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">{description}</p>
      )}
    </header>
  );
}
