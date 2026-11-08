import type { Locale } from "@/lib/i18n/config";
import type { episodeContent } from "@/lib/i18n/episode";
import { relativeDate } from "@/lib/format";
import {
  DeleteCommentButton,
} from "@/components/comments/delete-comment-button";
import {
  CommentForm,
} from "@/components/comments/comment-form";

export function EpisodeComments({
  comments,
  viewerId,
  isAdmin,
  episodeId,
  labels,
  locale,
}: {
  comments: Array<{
    id: string;
    userId: string;
    body: string;
    createdAt: Date;
    user: { name: string };
  }>;
  viewerId: string | null;
  isAdmin: boolean;
  episodeId: string;
  labels: typeof episodeContent["es"]["comments"];
  locale: Locale;
}) {
  return (
    <section className="mt-10 rounded-xl border border-border bg-surface p-6">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
        {labels.title} · {comments.length}
      </h2>

      <div className="mt-6">
        {comments.length === 0 ? (
          <p className="text-sm text-muted">{labels.empty}</p>
        ) : (
          <ul className="divide-y divide-border">
            {comments.map((comment) => (
              <li key={comment.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">{comment.user.name}</p>
                  <span className="font-mono text-[11px] text-subtle">
                    {relativeDate(comment.createdAt, locale)}
                  </span>
                </div>

                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {comment.body}
                </p>

                {(comment.userId === viewerId || isAdmin) && (
                  <div className="mt-2">
                    <DeleteCommentButton
                      id={comment.id}
                      label={labels.delete}
                      confirmLabel={labels.deleteConfirm}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {viewerId ? (
        <div className="mt-7 border-t border-border pt-5">
          <CommentForm episodeId={episodeId} labels={labels} />
        </div>
      ) : (
        <p className="mt-5 border-t border-border pt-5 text-sm text-muted">
          {labels.loginPrompt}{" "}
          <a href="/entrar" className="text-brand hover:underline">
            {labels.loginLink}
          </a>
        </p>
      )}
    </section>
  );
}
