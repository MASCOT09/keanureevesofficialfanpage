import type { Metadata } from "next";
import { deleteUserAction, updateUserMembershipAction, updateUserRoleAction } from "@/app/actions/admin-actions";
import { AdminPageHeader, AdminSubmitButton } from "@/components/admin/AdminForm";
import { DeleteAccountButton } from "@/components/admin/DeleteAccountButton";
import { FanCommunityStats } from "@/components/admin/FanCommunityStats";
import { getSession } from "@/lib/session";
import { buildFanCommunityStats } from "@/lib/fan-community-stats";
import { countAdmins, getAdminUserList } from "@/lib/repository";
import { formatDashboardDate } from "@/lib/dashboard-utils";
import { getMembershipLabel } from "@/lib/membership";
import type { MembershipTier } from "@/types/membership";

export const metadata: Metadata = {
  title: "Team & Admins",
  robots: { index: false, follow: false },
};

const membershipOptions: { value: MembershipTier; label: string }[] = [
  { value: "none", label: "No membership" },
  { value: "silver", label: "Silver Member" },
  { value: "gold", label: "Gold Member" },
  { value: "platinum", label: "Platinum Member" },
];

function membershipBadgeClass(tier: MembershipTier, isAdmin: boolean): string {
  if (isAdmin || tier === "platinum") return "bg-accent/15 text-accent";
  if (tier === "gold") return "bg-amber-500/15 text-amber-300";
  if (tier === "silver") return "bg-slate-400/15 text-slate-300";
  return "bg-white/5 text-muted";
}

function effectiveTier(user: { role: string; membership_tier: MembershipTier }): MembershipTier {
  return user.role === "admin" ? "platinum" : user.membership_tier;
}

function badgeLabel(tier: MembershipTier, isAdmin: boolean): string {
  if (isAdmin) return "Platinum (admin)";
  return getMembershipLabel(tier);
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const params = await searchParams;
  const [users, adminCount, session] = await Promise.all([
    getAdminUserList(),
    countAdmins(),
    getSession(),
  ]);
  const fanStats = buildFanCommunityStats(users);

  return (
    <div>
      <AdminPageHeader
        title="Team & Admins"
        description="Promote trusted fans to admin and assign membership badges when fans upgrade."
      />

      {params.error && (
        <div className="mb-6 rounded-[16px] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
          {params.error}
        </div>
      )}

      {params.updated === "role" && (
        <div className="mb-6 rounded-[16px] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-400">
          Role updated successfully.
        </div>
      )}

      {params.updated === "membership" && (
        <div className="mb-6 rounded-[16px] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-400">
          Membership badge updated successfully.
        </div>
      )}

      {params.updated === "deleted" && (
        <div className="mb-6 rounded-[16px] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-400">
          Account deleted successfully. Fan totals have been updated.
        </div>
      )}

      <FanCommunityStats stats={fanStats} />

      <div className="mb-8 rounded-[16px] border border-accent/20 bg-accent/5 px-5 py-4 text-sm text-muted">
        <p className="mb-2 text-foreground">
          <span className="font-medium text-accent">Roles:</span> Promote fans to admin so they can
          manage giveaways, events, and site content. All admins automatically receive the Platinum
          badge.
        </p>
        <p className="mb-2">
          <span className="font-medium text-accent">Membership badges:</span> When a fan upgrades
          offline, use the badge dropdown to set Silver, Gold, or Platinum. Their dashboard and
          perks update immediately after they refresh.
        </p>
        <p className="mb-2">
          <span className="font-medium text-accent">Removing test accounts:</span> Use{" "}
          <span className="text-foreground">Delete account</span> on fan rows to permanently remove
          test signups. Their messages and notifications are removed too, and fan totals update
          immediately.
        </p>
        <p className="mb-2">
          <span className="font-medium text-accent">Demoting admins:</span> You cannot remove your
          own admin access — ask another admin to change your role. You must keep at least one admin
          on the site. When an admin becomes a fan, their badge resets to no membership until you
          assign one.
        </p>
        <p>
          Promoted users must <span className="text-foreground">log out and log back in</span> before
          admin access appears. You currently have{" "}
          <span className="font-medium text-foreground">{adminCount}</span> admin
          {adminCount === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-border bg-card/60 text-xs uppercase tracking-[0.2em] text-muted">
              <tr>
                <th className="px-5 py-4 font-medium">Member</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">Joined</th>
                <th className="px-5 py-4 font-medium">Role</th>
                <th className="px-5 py-4 font-medium">Badge</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.map((user) => {
                const isSelf = session?.sub === user.id;
                const isAdmin = user.role === "admin";
                const tier = effectiveTier(user);
                const updateRole = updateUserRoleAction.bind(null, user.id);
                const updateMembership = updateUserMembershipAction.bind(null, user.id);
                const removeAccount = deleteUserAction.bind(null, user.id);

                return (
                  <tr key={user.id} className="bg-card/20">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{user.display_name}</p>
                      {user.country && <p className="text-xs text-muted">{user.country}</p>}
                      {isSelf && (
                        <span className="mt-1 inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted">{user.email}</td>
                    <td className="px-5 py-4 text-muted">{formatDashboardDate(user.created_at)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          isAdmin ? "bg-accent/15 text-accent" : "bg-white/5 text-muted"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${membershipBadgeClass(tier, isAdmin)}`}
                      >
                        {badgeLabel(tier, isAdmin)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-4">
                        <form action={updateRole} className="flex flex-wrap items-center gap-3">
                          <select
                            name="role"
                            defaultValue={user.role}
                            aria-label={`Role for ${user.display_name}`}
                            className="rounded-[12px] border border-border bg-background/80 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                          >
                            <option value="fan">Fan</option>
                            <option value="admin">Admin</option>
                          </select>
                          <AdminSubmitButton label="Update" />
                        </form>

                        {isAdmin ? (
                          <p className="text-xs text-muted">
                            Admins are always Platinum — no badge change needed.
                          </p>
                        ) : (
                          <form action={updateMembership} className="flex flex-wrap items-center gap-3">
                            <select
                              name="membership_tier"
                              defaultValue={user.membership_tier}
                              aria-label={`Membership badge for ${user.display_name}`}
                              className="rounded-[12px] border border-border bg-background/80 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                            >
                              {membershipOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <AdminSubmitButton label="Update" />
                          </form>
                        )}

                        {!isSelf && (
                          <DeleteAccountButton
                            deleteAction={removeAccount}
                            userName={user.display_name}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
