import type { DashboardData } from "@/lib/dashboard-data";

export function DashboardWelcome({
  data,
  isNewMember,
}: {
  data: DashboardData;
  isNewMember?: boolean;
}) {
  return (
    <section className="animate-fade-up border-b border-border/60 pb-8">
      <p className="mb-2 text-xs uppercase tracking-[0.4em] text-accent">Member Dashboard</p>
      <h1 className="font-display mb-3 text-2xl text-foreground sm:text-3xl">
        {isNewMember ? `Welcome, ${data.firstName}! 👋` : `Welcome back, ${data.firstName} 👋`}
      </h1>
      <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
        {isNewMember ? (
          "Your member account is ready. Explore giveaways, register for events, and check your inbox."
        ) : (
          <>
            Your private fan hub — track entries, events, and profile. Signed in as{" "}
            <span className="text-foreground">{data.email}</span>.
          </>
        )}
      </p>
    </section>
  );
}
