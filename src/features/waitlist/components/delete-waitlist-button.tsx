"use client";

import { deleteWaitlistAction } from "@/features/waitlist/actions";

export function DeleteWaitlistButton({
  id,
  label,
  confirmLabel,
}: {
  id: string;
  label: string;
  confirmLabel: string;
}) {
  return (
    <form
      action={deleteWaitlistAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmLabel)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-8 items-center rounded-lg border border-danger/40 bg-danger/10 px-3 text-xs text-danger transition-colors hover:bg-danger/20"
      >
        {label}
      </button>
    </form>
  );
}
