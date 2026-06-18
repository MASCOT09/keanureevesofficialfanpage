import Link from "next/link";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import type { DashboardData } from "@/lib/dashboard-data";

export function ProfileSummary({ data }: { data: DashboardData }) {
  const displayName = data.profile.display_name ?? "Fan";

  return (
    <section className="glass rounded-[20px] p-6 sm:p-8">
      <p className="mb-1 text-xs uppercase tracking-[0.35em] text-accent">Account</p>
      <h2 className="font-display mb-6 text-xl text-foreground sm:text-2xl">Profile Summary</h2>

      <div className="flex flex-col items-center text-center">
        <UserAvatar name={displayName} avatarUrl={data.profile.avatar_url} size="md" className="mb-5 shadow-[0_0_40px_rgba(212,175,55,0.12)]" />
        <h3 className="font-display mb-1 text-xl text-foreground">{displayName}</h3>
        <p className="mb-6 text-sm text-muted">{data.email}</p>

        <dl className="mb-8 w-full space-y-4 border-t border-border/60 pt-6 text-left">
          <div className="flex justify-between gap-4 text-sm">
            <dt className="text-muted">Member since</dt>
            <dd className="text-foreground">{data.stats.memberSince}</dd>
          </div>
          {data.profile.country ? (
            <div className="flex justify-between gap-4 text-sm">
              <dt className="text-muted">Country</dt>
              <dd className="text-foreground">{data.profile.country}</dd>
            </div>
          ) : (
            <div className="flex justify-between gap-4 text-sm">
              <dt className="text-muted">Country</dt>
              <dd className="text-muted/70">Not set</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 text-sm">
            <dt className="text-muted">Role</dt>
            <dd className="capitalize text-foreground">{data.profile.role}</dd>
          </div>
        </dl>

        <Link
          href="/dashboard/profile"
          className="w-full rounded-full border border-accent/40 bg-accent/15 py-3 text-center text-sm font-medium text-accent transition-all duration-300 hover:bg-accent/25"
        >
          Edit Profile
        </Link>
      </div>
    </section>
  );
}
