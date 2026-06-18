interface StatCardProps {
  label: string;
  value: string | number;
  delay?: string;
}

export function StatCard({ label, value, delay }: StatCardProps) {
  return (
    <div
      className={`luxury-card card-shine animate-fade-up p-6 sm:p-8 ${delay ?? ""}`}
    >
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted">{label}</p>
      <p className="font-display text-3xl text-accent sm:text-4xl">{value}</p>
    </div>
  );
}

export function DashboardStats({
  giveawayEntries,
  eventRegistrations,
  memberSince,
}: {
  giveawayEntries: number;
  eventRegistrations: number;
  memberSince: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
      <StatCard label="Giveaway Entries" value={giveawayEntries} />
      <StatCard label="Event Registrations" value={eventRegistrations} delay="animate-fade-up-delay" />
      <StatCard label="Member Since" value={memberSince} delay="animate-fade-up-delay-2" />
    </div>
  );
}
