import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-on-accent hover:bg-accent-hover shadow-[0_0_32px_rgba(212,175,55,0.2)] hover:shadow-[0_0_48px_rgba(212,175,55,0.35)]",
  secondary:
    "border border-border bg-card/40 text-foreground backdrop-blur-sm hover:border-accent/40 hover:bg-accent/5 hover:text-accent",
  ghost: "text-muted hover:text-accent",
};

interface ButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  href,
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium tracking-wide transition-all duration-400 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
}

export function SubmitButton({
  children,
  loading,
  className = "",
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      className={`w-full rounded-full bg-accent py-3.5 text-sm font-medium tracking-wide text-on-accent transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_32px_rgba(212,175,55,0.3)] disabled:opacity-50 ${className}`}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
