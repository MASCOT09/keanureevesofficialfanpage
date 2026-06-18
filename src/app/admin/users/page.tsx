import type { Metadata } from "next";
import { updateUserRoleAction } from "@/app/actions/admin-actions";
import { AdminPageHeader, AdminSubmitButton } from "@/components/admin/AdminForm";
import { getSession } from "@/lib/session";
import { countAdmins, getAdminUserList } from "@/lib/excel/repository";
import { formatDashboardDate } from "@/lib/dashboard-utils";

export const metadata: Metadata = {
  title: "Team & Admins",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const [users, adminCount, session] = await Promise.all([
    getAdminUserList(),
    countAdmins(),
    getSession(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Team & Admins"
        description="Promote trusted fans to admin so they can manage giveaways, events, and site content."
      />

      <div className="mb-8 rounded-[16px] border border-accent/20 bg-accent/5 px-5 py-4 text-sm text-muted">
        <p className="mb-2 text-foreground">
          <span className="font-medium text-accent">Getting started:</span> The first admin account
          comes from your database seed — log in with{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-foreground">admin@keanu.fan</code>{" "}
          / <code className="rounded bg-black/30 px-1.5 py-0.5 text-foreground">admin123</code>{" "}
          (or promote yourself once in Excel). After that, use this page to add more admins.
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
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-card/60 text-xs uppercase tracking-[0.2em] text-muted">
              <tr>
                <th className="px-5 py-4 font-medium">Member</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">Joined</th>
                <th className="px-5 py-4 font-medium">Role</th>
                <th className="px-5 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.map((user) => {
                const isSelf = session?.sub === user.id;
                const updateRole = updateUserRoleAction.bind(null, user.id);

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
                          user.role === "admin"
                            ? "bg-accent/15 text-accent"
                            : "bg-white/5 text-muted"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <form action={updateRole} className="flex flex-wrap items-center gap-3">
                        <select
                          name="role"
                          defaultValue={user.role}
                          className="rounded-[12px] border border-border bg-background/80 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"
                        >
                          <option value="fan">Fan</option>
                          <option value="admin">Admin</option>
                        </select>
                        <AdminSubmitButton label="Update" />
                      </form>
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
