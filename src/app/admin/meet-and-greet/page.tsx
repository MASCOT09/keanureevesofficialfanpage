import { getAllMeetGreetEvents } from "@/lib/repository";
import {
  createMeetGreetEvent,
  deleteMeetGreetEventForm,
  updateMeetGreetEvent,
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

export default async function AdminMeetGreetPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; updated?: string }>;
}) {
  const params = await searchParams;
  const events = await getAllMeetGreetEvents();

  return (
    <div>
      <AdminPageHeader
        title="Meet & Greet Events"
        description="Create events fans can register for. Set status to Upcoming so they appear on /meet-and-greet."
      />

      {params.error && (
        <div className="mb-6 rounded-[16px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {decodeURIComponent(params.error)}
        </div>
      )}
      {params.created && (
        <div className="mb-6 rounded-[16px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Event created successfully.
        </div>
      )}
      {params.updated && (
        <div className="mb-6 rounded-[16px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Event updated successfully.
        </div>
      )}

      <AdminCard className="mb-12">
        <h2 className="font-display mb-6 text-xl text-foreground">Create Event</h2>
        <form action={createMeetGreetEvent} encType="multipart/form-data" className="space-y-4">
          <AdminFormField label="Title" name="title" required />
          <AdminFormField label="Description" name="description" rows={3} />
          <AdminFormField label="Location" name="location" />
          <AdminMultiImageField label="Event images" />
          <AdminFormField
            label="Event Date"
            name="event_date"
            type="datetime-local"
            required
          />
          <AdminFormField
            label="Max Spots"
            name="max_spots"
            type="number"
            defaultValue={50}
            required
          />
          <AdminSelect
            label="Status"
            name="status"
            defaultValue="upcoming"
            options={[
              { value: "upcoming", label: "Upcoming" },
              { value: "closed", label: "Closed" },
            ]}
          />
          <AdminSubmitButton label="Create" pendingLabel="Creating..." />
        </form>
      </AdminCard>

      <div className="space-y-6">
        {events?.map((event) => (
          <AdminCard key={event.id}>
            <form
              action={updateMeetGreetEvent.bind(null, event.id)}
              encType="multipart/form-data"
              className="space-y-4"
            >
              <AdminFormField label="Title" name="title" defaultValue={event.title} required />
              <AdminFormField
                label="Description"
                name="description"
                defaultValue={event.description ?? ""}
                rows={2}
              />
              <AdminFormField
                label="Location"
                name="location"
                defaultValue={event.location ?? ""}
              />
              <AdminMultiImageField
                label="Event images"
                currentUrls={resolveImageList(event)}
              />
              <AdminFormField
                label="Event Date"
                name="event_date"
                type="datetime-local"
                defaultValue={event.event_date.slice(0, 16)}
                required
              />
              <AdminFormField
                label="Max Spots"
                name="max_spots"
                type="number"
                defaultValue={event.max_spots}
                required
              />
              <AdminSelect
                label="Status"
                name="status"
                defaultValue={event.status}
                options={[
                  { value: "upcoming", label: "Upcoming" },
                  { value: "closed", label: "Closed" },
                ]}
              />
              <AdminSubmitButton label="Update" pendingLabel="Updating..." />
            </form>
            <form action={deleteMeetGreetEventForm} className="mt-3">
              <input type="hidden" name="id" value={event.id} />
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
