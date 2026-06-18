import { getAllSiteButtons } from "@/lib/repository";
import { updateSiteButton } from "@/app/actions/admin-actions";
import {
  AdminFormField,
  AdminSelect,
  AdminSubmitButton,
  AdminPageHeader,
  AdminCard,
} from "@/components/admin/AdminForm";

export default async function AdminSiteButtonsPage() {
  const buttons = await getAllSiteButtons();
  const sections = [...new Set(buttons.map((b) => b.section))];

  return (
    <div>
      <AdminPageHeader
        title="Button Links"
        description="Control where every navigation and call-to-action button goes across the public site. Use internal paths (e.g. /signup) or full URLs (e.g. https://t.me/yourgroup)."
      />

      <div className="mb-8 rounded-[16px] border border-border/80 bg-card/40 px-5 py-4 text-sm text-muted">
        <p className="mb-2 font-medium text-foreground">Also editable elsewhere</p>
        <ul className="space-y-1 text-xs sm:text-sm">
          <li>
            <span className="text-accent">Communities</span> — each community card&apos;s external join URL
          </li>
          <li>
            <span className="text-accent">Contact Links</span> — WhatsApp, Zangi, and Telegram DM buttons
          </li>
        </ul>
      </div>

      {sections.map((section) => (
        <div key={section} className="mb-12">
          <h2 className="font-display mb-6 text-2xl text-foreground">{section}</h2>
          <div className="space-y-6">
            {buttons
              .filter((button) => button.section === section)
              .map((button) => (
                <AdminCard key={button.id}>
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-accent">{button.button_key}</p>
                    {button.description && (
                      <p className="mt-1 text-sm text-muted">{button.description}</p>
                    )}
                  </div>
                  <form action={updateSiteButton.bind(null, button.id)} className="space-y-4">
                    <AdminFormField label="Button label" name="label" defaultValue={button.label} required />
                    <AdminFormField
                      label="Link (href)"
                      name="href"
                      defaultValue={button.href}
                      placeholder="/signup or https://example.com"
                      required
                    />
                    <AdminSelect
                      label="Open in new tab"
                      name="open_in_new_tab"
                      defaultValue={button.open_in_new_tab ? "true" : "false"}
                      options={[
                        { value: "false", label: "Same tab" },
                        { value: "true", label: "New tab" },
                      ]}
                    />
                    <AdminSelect
                      label="Active"
                      name="is_active"
                      defaultValue={button.is_active ? "true" : "false"}
                      options={[
                        { value: "true", label: "Yes" },
                        { value: "false", label: "No" },
                      ]}
                    />
                    <AdminSubmitButton label="Update" />
                  </form>
                </AdminCard>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
