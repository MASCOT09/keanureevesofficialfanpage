import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-28 text-center lg:px-10">
      <p className="mb-4 text-xs uppercase tracking-[0.4em] text-accent">404</p>
      <h2 className="font-display mb-4 text-3xl text-foreground">Page not found</h2>
      <p className="mb-10 leading-relaxed text-muted">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="rounded-full bg-accent px-8 py-3 text-sm font-medium tracking-wide text-[#0F0F10] transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_32px_rgba(212,175,55,0.3)]"
      >
        Go home
      </Link>
    </div>
  );
}
