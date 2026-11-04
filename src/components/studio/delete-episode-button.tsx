"use client";

import { deleteEpisodeAction } from "@/app/estudio/actions";

export function DeleteEpisodeButton({ id }: { id: string }) {
  return (
    <form
      action={deleteEpisodeAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "¿Borrar este episodio? Se elimina el audio y no se puede deshacer.",
        );

        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs text-subtle underline-offset-2 transition-colors hover:text-danger hover:underline"
      >
        Borrar
      </button>
    </form>
  );
}
