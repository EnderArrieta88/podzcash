"use client";

import { deleteEpisodeAction } from "@/features/episodes/actions";

export function DeleteEpisodeButton({
  id,
  labels,
}: {
  id: string;
  labels: { confirm: string; label: string };
}) {
  return (
    <form
      action={deleteEpisodeAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(labels.confirm);

        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs text-subtle underline-offset-2 transition-colors hover:text-danger hover:underline"
      >
        {labels.label}
      </button>
    </form>
  );
}
