"use client";

import { useState } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl gap-12 px-6 py-12 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-10 lg:py-20">
      <div className="glass relative hidden overflow-hidden rounded-[20px] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(212,175,55,0.1),transparent_60%)]" />
        <div className="relative flex min-h-[520px] flex-col justify-end p-12">
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-accent">
            Official Fan Experience
          </p>
          <h2 className="font-display mb-5 text-4xl leading-tight text-foreground">
            Welcome, fan.
          </h2>
          <p className="max-w-md leading-relaxed text-muted">
            Giveaways, meet & greets, exclusive communities, and direct access — your
            official connection to Keanu Reeves.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-10 lg:hidden">
          <h1 className="font-display mb-3 text-3xl text-foreground">{title}</h1>
          <p className="leading-relaxed text-muted">{subtitle}</p>
        </div>
        <div className="glass rounded-[20px] p-8 sm:p-10">
          <div className="mb-8 hidden lg:block">
            <h1 className="font-display mb-3 text-3xl text-foreground">{title}</h1>
            <p className="leading-relaxed text-muted">{subtitle}</p>
          </div>
          <div className="mb-8 lg:hidden">
            <p className="text-xs uppercase tracking-[0.4em] text-accent">Account</p>
          </div>
          {children}
        </div>
        <div className="mt-8 text-center text-sm text-muted">{footer}</div>
      </div>
    </div>
  );
}

export function AuthInput({
  label,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm tracking-wide text-muted">
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-[16px] border border-border bg-[var(--input-bg)] px-4 py-3.5 text-foreground outline-none transition-all duration-300 placeholder:text-muted/40 focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
        {...props}
      />
    </div>
  );
}

export function AuthPasswordInput({
  label,
  id,
  name,
  defaultValue,
  value,
  onChange,
  placeholder,
  required,
  minLength,
}: {
  label: string;
  id: string;
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  const controlled = value !== undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm tracking-wide text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          {...(controlled ? { value, onChange } : { defaultValue })}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className="w-full rounded-[16px] border border-border bg-[var(--input-bg)] py-3.5 pl-4 pr-12 text-foreground outline-none transition-all duration-300 placeholder:text-muted/40 focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition-colors hover:text-accent"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858 3.03a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <div className="rounded-[16px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {message}
    </div>
  );
}
