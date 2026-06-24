import { getAllGiveaways } from "@/lib/repository";
import {
  createGiveaway,
  deleteGiveawayForm,
  updateGiveaway,
} from "@/app/actions/admin-actions";
import {
  AdminFormField,
  AdminMultiImageField,
  AdminSelect,
  AdminSubmitButton,
  AdminPageHeader,
  AdminCard,
} from "@/components/admin/AdminForm";
import { resolveImageList } from "@/lib/media-upload";

export default async function AdminGiveawaysPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; updated?: string }>;
}) {
  const params = await searchParams;
  const giveaways = await getAllGiveaways();

  return (
    <div>
      <AdminPageHeader
        title="Giveaways"
        description="Create and manage fan giveaways. Set status to Active for fans to see and enter them on /giveaways."
      />

      {params.error && (
        <div className="mb-6 rounded-[16px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {decodeURIComponent(params.error)}
        </div>
      )}
      {params.created && (
        <div className="mb-6 rounded-[16px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Giveaway created successfully.
        </div>
      )}
      {params.updated && (
        <div className="mb-6 rounded-[16px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Giveaway updated successfully.
        </div>
      )}

      <AdminCard className="mb-12">
        <h2 className="font-display mb-6 text-xl text-foreground">Create Giveaway</h2>
        <form action={createGiveaway} encType="multipart/form-data" className="space-y-4">
          <AdminFormField label="Title" name="title" required />
          <AdminFormField label="Description" name="description" rows={3} />
          <AdminFormField label="Rules" name="rules" rows={3} />
          <AdminMultiImageField label="Prize images" />
          <AdminFormField
            label="Ends At"
            name="ends_at"
            type="datetime-local"
            required
          />
          <AdminSelect
            label="Status"
            name="status"
            defaultValue="draft"
            options={[
              { value: "draft", label: "Draft" },
              { value: "active", label: "Active" },
              { value: "closed", label: "Closed" },
            ]}
          />
          <AdminSubmitButton label="Create" />
        </form>
      </AdminCard>

      <div className="space-y-6">
        {giveaways.map((g) => (
          <AdminCard key={g.id}>
            <form
              action={updateGiveaway.bind(null, g.id)}
              encType="multipart/form-data"
              className="space-y-4"
            >
              <AdminFormField label="Title" name="title" defaultValue={g.title} required />
              <AdminFormField
                label="Description"
                name="description"
                defaultValue={g.description ?? ""}
                rows={2}
              />
              <AdminFormField
                label="Rules"
                name="rules"
                defaultValue={g.rules ?? ""}
                rows={2}
              />
              <AdminMultiImageField
                label="Prize images"
                currentUrls={resolveImageList(g)}
              />
              <AdminFormField
                label="Ends At"
                name="ends_at"
                type="datetime-local"
                defaultValue={g.ends_at.slice(0, 16)}
                required
              />
              <AdminSelect
                label="Status"
                name="status"
                defaultValue={g.status}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "active", label: "Active" },
                  { value: "closed", label: "Closed" },
                ]}
              />
              <AdminSubmitButton label="Update" />
            </form>
            <form action={deleteGiveawayForm} className="mt-3">
              <input type="hidden" name="id" value={g.id} />
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
