interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="glass relative mb-16 overflow-hidden rounded-[20px] px-8 py-14 sm:px-12">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/8 blur-3xl" />
      <div className="relative">
        {eyebrow && (
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-accent">{eyebrow}</p>
        )}
        <h1 className="font-display mb-5 text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
