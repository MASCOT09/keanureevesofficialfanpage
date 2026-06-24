import type { AdminUserSummary } from "@/lib/repository";

export type ContentViewType = "giveaway" | "meet_greet";

export interface ContentViewer extends AdminUserSummary {
  viewed_at: string;
}
