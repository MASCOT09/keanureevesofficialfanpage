"use client";

export function DeleteAccountButton({
  deleteAction,
  userName,
}: {
  deleteAction: (formData: FormData) => void | Promise<void>;
  userName: string;
}) {
  return (
    <form
      action={deleteAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Permanently delete ${userName}'s account?\n\nThis removes their messages, notifications, and entries. This cannot be undone.`
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-red-500/30 px-4 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
      >
        Delete account
      </button>
    </form>
  );
}
