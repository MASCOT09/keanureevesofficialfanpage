"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-28 text-center lg:px-10">
      <p className="mb-4 text-xs uppercase tracking-[0.4em] text-accent">Error</p>
      <h2 className="font-display mb-4 text-3xl text-foreground">Something went wrong</h2>
      <p className="mb-10 text-sm leading-relaxed text-muted">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-full bg-accent px-8 py-3 text-sm font-medium tracking-wide text-[#0F0F10] transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_32px_rgba(212,175,55,0.3)]"
      >
        Try again
      </button>
    </div>
  );
}
