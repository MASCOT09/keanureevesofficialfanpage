import { getFansForMessaging } from "@/lib/excel/repository";
import { sendAdminMessageAction } from "@/app/actions/admin-actions";
import {
  AdminFormField,
  AdminSelect,
  AdminSubmitButton,
  AdminPageHeader,
  AdminCard,
} from "@/components/admin/AdminForm";

export default async function AdminMessagesPage() {
  const fans = await getFansForMessaging();

  return (
    <div>
      <AdminPageHeader
        title="Fan Messages"
        description="Send inbox messages to one fan or everyone. Fans see these under Dashboard → My Messages."
      />

      <AdminCard className="mb-8">
        <h2 className="font-display mb-2 text-xl text-foreground">Compose message</h2>
        <p className="mb-6 text-sm text-muted">
          Use this for announcements, winner updates, event details, or personal notes from the team.
        </p>

        <form action={sendAdminMessageAction} className="space-y-4">
          <AdminSelect
            label="Send to"
            name="recipient"
            defaultValue="all"
            options={[
              { value: "all", label: `All fans (${fans.length})` },
              ...fans.map((fan) => ({
                value: fan.id,
                label: `${fan.display_name} (${fan.email})`,
              })),
            ]}
          />
          <AdminFormField
            label="From name"
            name="from_name"
            defaultValue="Keanu Fan Team"
            required
          />
          <AdminFormField label="Subject" name="subject" required />
          <AdminFormField label="Message" name="body" rows={8} required />
          <label className="flex items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              name="also_notify"
              defaultChecked
              className="mt-1 rounded border-border"
            />
            <span>
              Also send a <span className="text-foreground">notification</span> (short alert on the
              fan dashboard bell icon)
            </span>
          </label>
          <AdminSubmitButton label="Send message" />
        </form>
      </AdminCard>

      <AdminCard>
        <h3 className="font-display mb-3 text-lg text-foreground">Registered fans</h3>
        {!fans.length ? (
          <p className="text-sm text-muted">No fan accounts yet. Messages can be sent once fans sign up.</p>
        ) : (
          <ul className="divide-y divide-border/60 text-sm">
            {fans.map((fan) => (
              <li key={fan.id} className="flex flex-wrap justify-between gap-2 py-3">
                <span className="text-foreground">{fan.display_name}</span>
                <span className="text-muted">{fan.email}</span>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
