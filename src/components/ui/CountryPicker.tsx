"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { COUNTRIES } from "@/lib/countries";

interface CountryPickerProps {
  id?: string;
  name?: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function CountryPicker({
  id: idProp,
  name = "country",
  label = "Country",
  defaultValue = "",
  placeholder = "Search or select your country",
  required = false,
  className = "",
}: CountryPickerProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const listId = `${id}-list`;
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...COUNTRIES];
    return COUNTRIES.filter((country) => country.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  function selectCountry(country: string) {
    setQuery(country);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open || !filtered.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((value) => Math.min(value + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      selectCountry(filtered[highlight]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label htmlFor={id} className="mb-2 block text-sm tracking-wide text-muted">
        {label}
      </label>
      <input type="hidden" name={name} value={query} />
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={query}
        required={required}
        placeholder={placeholder}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full rounded-[16px] border border-border bg-[var(--input-bg)] px-4 py-3.5 text-foreground outline-none transition-all duration-300 placeholder:text-muted/40 focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
      />
      {open && filtered.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-2 max-h-56 w-full overflow-y-auto rounded-[16px] border border-border bg-card py-2 shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
        >
          {filtered.slice(0, 80).map((country, index) => (
            <li key={country} role="option" aria-selected={query === country}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectCountry(country)}
                className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  index === highlight
                    ? "bg-accent/10 text-accent"
                    : "text-foreground hover:bg-white/5"
                }`}
              >
                {country}
              </button>
            </li>
          ))}
          {filtered.length > 80 && (
            <li className="px-4 py-2 text-xs text-muted">Keep typing to narrow results…</li>
          )}
        </ul>
      )}
      {open && query.trim() && filtered.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-[16px] border border-border bg-card px-4 py-3 text-sm text-muted shadow-lg">
          No matching country. Check spelling or try another name.
        </div>
      )}
    </div>
  );
}
