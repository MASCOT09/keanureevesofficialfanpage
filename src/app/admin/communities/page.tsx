import { getAllCommunities } from "@/lib/repository";
import {
  createCommunity,
  deleteCommunityForm,
  updateCommunity,
} from "@/app/actions/admin-actions";
import {
  AdminFormField,
  AdminSelect,
  AdminSubmitButton,
  AdminPageHeader,
  AdminCard,
} from "@/components/admin/AdminForm";

export default async function AdminCommunitiesPage() {
  const communities = await getAllCommunities();

  return (
    <div>
      <AdminPageHeader title="Communities" description="Manage fan community links." />

      <AdminCard className="mb-12">
        <h2 className="font-display mb-6 text-xl text-foreground">Add Community</h2>
        <form action={createCommunity} className="space-y-4">
          <AdminFormField label="Name" name="name" required />
          <AdminFormField label="Description" name="description" rows={2} />
          <AdminFormField label="Platform" name="platform" defaultValue="telegram" required />
          <AdminFormField label="URL" name="url" required />
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
        {communities?.map((c) => (
          <AdminCard key={c.id}>
            <form action={updateCommunity.bind(null, c.id)} className="space-y-4">
              <AdminFormField label="Name" name="name" defaultValue={c.name} required />
              <AdminFormField
                label="Description"
                name="description"
                defaultValue={c.description ?? ""}
                rows={2}
              />
              <AdminFormField label="Platform" name="platform" defaultValue={c.platform} required />
              <AdminFormField label="URL" name="url" defaultValue={c.url} required />
              <AdminFormField
                label="Sort Order"
                name="sort_order"
                type="number"
                defaultValue={c.sort_order}
              />
              <AdminSelect
                label="Active"
                name="is_active"
                defaultValue={c.is_active ? "true" : "false"}
                options={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
              />
              <AdminSubmitButton label="Update" />
            </form>
            <form action={deleteCommunityForm} className="mt-3">
              <input type="hidden" name="id" value={c.id} />
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
