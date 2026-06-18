import { getSiteSettings } from "@/lib/repository";
import { updateSiteSettings } from "@/app/actions/admin-actions";
import {
  AdminFormField,
  AdminSubmitButton,
  AdminPageHeader,
  AdminCard,
} from "@/components/admin/AdminForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <AdminPageHeader title="Site Settings" description="Configure branding and intro video." />
      <AdminCard className="max-w-xl">
        <form action={updateSiteSettings} className="space-y-5">
          <AdminFormField
            label="Celebrity Name"
            name="celebrity_name"
            defaultValue={settings?.celebrity_name}
            required
          />
          <AdminFormField
            label="Tagline"
            name="tagline"
            defaultValue={settings?.tagline ?? ""}
          />
          <AdminFormField
            label="Hero Video URL"
            name="hero_video_url"
            defaultValue={settings?.hero_video_url ?? ""}
          />
          <p className="text-xs leading-relaxed text-muted">
            Add your intro MP4 to <code className="text-foreground/80">public/videos/intro.mp4</code>{" "}
            and set the URL to <code className="text-foreground/80">/videos/intro.mp4</code>, or paste
            any public video URL (YouTube direct link, CDN, etc.).
          </p>
          <AdminSubmitButton label="Save Settings" />
        </form>
      </AdminCard>
    </div>
  );
}
