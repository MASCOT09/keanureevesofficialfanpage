import { getAllMembershipApplications } from "@/lib/repository";
import {
  approveMembershipApplicationAction,
  rejectMembershipApplicationAction,
} from "@/app/actions/admin-actions";
import { AdminPageHeader, AdminCard } from "@/components/admin/AdminForm";
import { getMembershipLabel } from "@/lib/membership";

export default async function AdminMembershipsPage() {
  const applications = await getAllMembershipApplications();

  return (
    <div>
      <AdminPageHeader
        title="Membership Applications"
        description="Review fan applications for Silver ($100), Gold ($250), and Platinum ($500) membership."
      />

      <div className="space-y-4">
        {!applications.length ? (
          <AdminCard>
            <p className="text-sm text-muted">No membership applications yet.</p>
          </AdminCard>
        ) : (
          applications.map((application) => (
            <AdminCard key={application.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-display text-lg text-foreground">{application.user_name}</p>
                  <p className="text-sm text-muted">{application.user_email}</p>
                  <p className="mt-2 text-sm text-foreground">
                    {getMembershipLabel(application.tier)} · ${application.amount}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
                    {application.status} · {new Date(application.created_at).toLocaleString()}
                  </p>
                </div>

                {application.status === "pending" ? (
                  <div className="flex flex-wrap gap-3">
                    <form action={approveMembershipApplicationAction}>
                      <input type="hidden" name="id" value={application.id} />
                      <button
                        type="submit"
                        className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-on-accent"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={rejectMembershipApplicationAction}>
                      <input type="hidden" name="id" value={application.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-border px-5 py-2 text-sm text-muted hover:text-foreground"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                ) : (
                  <p className="text-sm capitalize text-muted">{application.status}</p>
                )}
              </div>
            </AdminCard>
          ))
        )}
      </div>
    </div>
  );
}
