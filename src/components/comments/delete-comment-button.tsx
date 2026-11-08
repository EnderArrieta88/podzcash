"use client";

import {
  deleteEpisodeCommentAction,
} from "@/app/(app)/canal/[handle]/[slug]/comments-actions";

export function DeleteCommentButton({
  id,
  path,
  label,
  confirmLabel,
}: {
  id: string;
  path?: string;
  label: string;
  confirmLabel: string;
}) {
  return (
    <form
      action={deleteEpisodeCommentAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmLabel)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      {path ? <input type="hidden" name="path" value={path} /> : null}

      <button
        type="submit"
        className="text-xs text-subtle transition-colors hover:text-danger"
      >
        {label}
      </button>
    </form>
  );
}
