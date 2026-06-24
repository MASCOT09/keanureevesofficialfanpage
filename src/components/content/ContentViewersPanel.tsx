"use client";

import { useState } from "react";
import type { ContentViewer } from "@/lib/content-views";
import { getMembershipLabel } from "@/lib/membership";
import { formatDashboardDate } from "@/lib/dashboard-utils";

export function ContentViewersPanel({ viewers }: { viewers: ContentViewer[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-10 border-t border-border/60 pt-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm tracking-wide text-muted transition-colors hover:text-accent"
        >
          {viewers.length} fan{viewers.length === 1 ? "" : "s"} viewed
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="luxury-card max-h-[80vh] w-full max-w-lg overflow-hidden"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="viewers-title"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <h2 id="viewers-title" className="font-display text-lg text-foreground">
                Fans who viewed ({viewers.length})
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Close
              </button>
            </div>
            <ul className="max-h-[60vh] list-none overflow-y-auto divide-y divide-border/40">
              {viewers.length === 0 ? (
                <li className="px-6 py-8 text-center text-sm text-muted">No views yet.</li>
              ) : (
                viewers.map((viewer) => (
                  <li key={viewer.id} className="px-6 py-4">
                    <p className="font-medium text-foreground">{viewer.display_name}</p>
                    <p className="text-sm text-muted">{viewer.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                      {viewer.country && <span>{viewer.country}</span>}
                      <span>{getMembershipLabel(viewer.membership_tier)}</span>
                      <span>Viewed {formatDashboardDate(viewer.viewed_at)}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
