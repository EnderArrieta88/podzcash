"use client";

import { useActionState } from "react";
import { addEpisodeCommentAction } from "@/features/comments/actions";
import { Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { episodeContent } from "@/lib/i18n/episode";

/**
 * Solo recibe textos: el objeto completo de etiquetas incluye funciones
 * (paginación) que no se pueden serializar hacia un componente cliente.
 */
export function CommentForm({
  episodeId,
  labels,
}: {
  episodeId: string;
  labels: Pick<
    (typeof episodeContent)["es"]["comments"],
    "placeholder" | "submit" | "pending"
  >;
}) {
  const [state, action] = useActionState(addEpisodeCommentAction, null);

  return (
    <form action={action} className="space-y-3">
      {state?.error && (
        <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <input type="hidden" name="episodeId" value={episodeId} />
      <Textarea
        id="comment-body"
        name="body"
        rows={3}
        maxLength={600}
        required
        placeholder={labels.placeholder}
        className="resize-y"
      />

      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] text-subtle">600 max</span>

        <SubmitButton pendingLabel={labels.pending}>
          {labels.submit}
        </SubmitButton>
      </div>
    </form>
  );
}
