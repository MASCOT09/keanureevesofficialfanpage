import type { ReactNode } from "react";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";

export { AdminSubmitButton };

export function AdminFormField({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  rows,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  const className =
    "w-full rounded-[16px] border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition-all duration-300 focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]";

  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm tracking-wide text-muted">
        {label}
      </label>
      {rows ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          className={className}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          className={className}
        />
      )}
    </div>
  );
}

export function AdminSelect({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm tracking-wide text-muted">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-[16px] border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition-all duration-300 focus:border-accent/50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AdminImageField({
  label = "Prize image",
  currentUrl,
  name = "image",
}: {
  label?: string;
  currentUrl?: string | null;
  name?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm tracking-wide text-muted">
        {label}
      </label>
      {currentUrl && (
        <div className="mb-3 overflow-hidden rounded-[12px] border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentUrl} alt="Current image" className="max-h-48 w-full object-cover" />
        </div>
      )}
      <input
        id={name}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="w-full rounded-[16px] border border-border bg-background/80 px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-accent/15 file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent"
      />
      <p className="mt-2 text-xs text-muted">JPG, PNG, or WebP — max 3 MB</p>
      {currentUrl && (
        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="remove_image" className="rounded border-border" />
          Remove current image
        </label>
      )}
    </div>
  );
}

export function AdminMultiImageField({
  label = "Images",
  currentUrls = [],
  name = "images",
}: {
  label?: string;
  currentUrls?: string[];
  name?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm tracking-wide text-muted">
        {label}
      </label>
      {currentUrls.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {currentUrls.map((url) => (
            <div key={url} className="overflow-hidden rounded-[12px] border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
            </div>
          ))}
        </div>
      )}
      <input
        id={name}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="w-full rounded-[16px] border border-border bg-background/80 px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-accent/15 file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent"
      />
      <p className="mt-2 text-xs text-muted">
        Select one or more images — JPG, PNG, WebP, or GIF, max 5 MB each
      </p>
      {currentUrls.length > 0 && (
        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="remove_images" className="rounded border-border" />
          Remove all current images
        </label>
      )}
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description?: ReactNode;
}) {
  return (
    <div className="mb-10">
      <h1 className="font-display mb-2 text-3xl text-foreground">{title}</h1>
      {description && <div className="text-muted">{description}</div>}
    </div>
  );
}

export function AdminCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`luxury-card p-6 ${className}`}>{children}</div>
  );
}
