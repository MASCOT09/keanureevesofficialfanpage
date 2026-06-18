import { getAllContactLinks } from "@/lib/excel/repository";
import {
  createContactLink,
  deleteContactLinkForm,
  updateContactLink,
} from "@/app/actions/admin-actions";
import {
  AdminFormField,
  AdminSelect,
  AdminSubmitButton,
  AdminPageHeader,
  AdminCard,
} from "@/components/admin/AdminForm";

const recipientOptions = [
  { value: "keanu", label: "Keanu Reeves contact" },
  { value: "team", label: "Keanu Reeves Manager Team" },
];

const platformOptions = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "zangi", label: "Zangi" },
  { value: "telegram", label: "Telegram" },
];

export default async function AdminContactLinksPage() {
  const links = await getAllContactLinks();

  return (
    <div>
      <AdminPageHeader
        title="Contact Links"
        description="Set up 6 private DM buttons: Keanu Reeves and Keanu's Team, each on WhatsApp, Zangi, and Telegram."
      />

      <div className="mb-8 rounded-[16px] border border-border/80 bg-card/40 px-5 py-4 text-sm text-muted">
        <p className="mb-2 font-medium text-foreground">Layout fans will see</p>
        <ul className="space-y-1 text-xs sm:text-sm">
          <li>
            <span className="text-accent">Keanu Reeves contact</span> — WhatsApp, Zangi, Telegram
          </li>
          <li>
            <span className="text-accent">Keanu Reeves Manager Team</span> — WhatsApp, Zangi,
            Telegram
          </li>
        </ul>
        <p className="mt-3 text-xs">
          Example URLs:{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5">https://wa.me/1234567890</code>,{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5">https://t.me/username</code>
        </p>
      </div>

      <AdminCard className="mb-12">
        <h2 className="font-display mb-6 text-xl text-foreground">Add Contact Link</h2>
        <form action={createContactLink} className="space-y-4">
          <AdminSelect
            label="Recipient"
            name="recipient"
            defaultValue="keanu"
            options={recipientOptions}
          />
          <AdminSelect
            label="Platform"
            name="platform"
            defaultValue="whatsapp"
            options={platformOptions}
          />
          <AdminFormField
            label="Button label"
            name="label"
            placeholder="Message on WhatsApp"
            required
          />
          <AdminFormField
            label="URL"
            name="url"
            placeholder="https://wa.me/1234567890"
            required
          />
          <p className="text-xs text-muted">
            WhatsApp: use full international number (e.g. 919133345491 for India). Opens chat
            directly in the WhatsApp app.
          </p>
          <AdminFormField label="Sort Order" name="sort_order" type="number" defaultValue={0} />
          <AdminSelect
            label="Active"
            name="is_active"
            defaultValue="true"
            options={[
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ]}
          />
          <AdminSubmitButton label="Create" />
        </form>
      </AdminCard>

      <div className="space-y-6">
        {links?.map((link) => (
          <AdminCard key={link.id}>
            <form action={updateContactLink.bind(null, link.id)} className="space-y-4">
              <AdminSelect
                label="Recipient"
                name="recipient"
                defaultValue={link.recipient}
                options={recipientOptions}
              />
              <AdminSelect
                label="Platform"
                name="platform"
                defaultValue={link.platform}
                options={platformOptions}
              />
              <AdminFormField label="Button label" name="label" defaultValue={link.label} required />
              <AdminFormField label="URL" name="url" defaultValue={link.url} required />
              <AdminFormField
                label="Sort Order"
                name="sort_order"
                type="number"
                defaultValue={link.sort_order}
              />
              <AdminSelect
                label="Active"
                name="is_active"
                defaultValue={link.is_active ? "true" : "false"}
                options={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
              />
              <AdminSubmitButton label="Update" />
            </form>
            <form action={deleteContactLinkForm} className="mt-3">
              <input type="hidden" name="id" value={link.id} />
              <button type="submit" className="text-sm text-red-400 hover:underline">
                Delete
              </button>
            </form>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
