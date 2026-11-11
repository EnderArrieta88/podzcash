import type { Locale } from "@/lib/i18n/config";
import type { episodeContent } from "@/lib/i18n/episode";
import { relativeDate } from "@/lib/format";
import { DeleteCommentButton } from "./delete-comment-button";
import { CommentForm } from "./comment-form";
import { cn } from "@/lib/utils";

type Labels = (typeof episodeContent)["es"]["comments"];

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const className =
    "inline-flex h-8 items-center rounded-full border border-border bg-surface-2 px-3 text-xs transition-colors";

  if (disabled) {
    return (
      <span className={cn(className, "cursor-not-allowed text-subtle/50")}>
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      className={cn(
        className,
        "text-muted hover:border-border-strong hover:text-text",
      )}
    >
      {children}
    </a>
  );
}

export function EpisodeComments({
  comments,
  viewerId,
  viewerChannelId,
  isAdmin,
  episodeId,
  episodeChannelId,
  episodePath,
  total,
  page,
  pageCount,
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
  viewerChannelId: string | null;
  isAdmin: boolean;
  episodeId: string;
  episodeChannelId: string;
  episodePath: string;
  total: number;
  page: number;
  pageCount: number;
  labels: Labels;
  locale: Locale;
}) {
  const pageHref = (value: number) =>
    `${episodePath}?comentarios=${value}#comentarios`;

  return (
    <section
      id="comentarios"
      className="mt-10 scroll-mt-24 rounded-xl border border-border bg-surface p-6"
    >
      <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
        {labels.title} · {total}
      </h2>

      {viewerId ? (
        <div className="mt-5 border-b border-border pb-5">
          <CommentForm
            episodeId={episodeId}
            labels={{
              placeholder: labels.placeholder,
              submit: labels.submit,
              pending: labels.pending,
            }}
          />
        </div>
      ) : (
        <p className="mt-4 border-b border-border pb-5 text-sm text-muted">
          {labels.loginPrompt}{" "}
          <a href="/entrar" className="text-brand hover:underline">
            {labels.loginLink}
          </a>
        </p>
      )}

      <div className="mt-5">
        {comments.length === 0 ? (
          <p className="text-sm text-muted">{labels.empty}</p>
        ) : (
          <ul className="divide-y divide-border">
            {comments.map((comment) => {
              const canDelete =
                comment.userId === viewerId ||
                isAdmin ||
                viewerChannelId === episodeChannelId;

              return (
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

                  {(canDelete || (viewerId && comment.userId !== viewerId)) && (
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                      {canDelete && (
                        <DeleteCommentButton
                          id={comment.id}
                          path={`${episodePath}?comentarios=${page}#comentarios`}
                          label={labels.delete}
                          confirmLabel={labels.deleteConfirm}
                        />
                      )}

                      {viewerId && comment.userId !== viewerId && (
                        <a
                          href={`/reportar/comentario/${comment.id}`}
                          className="text-xs text-subtle transition-colors hover:text-danger"
                        >
                          {labels.report}
                        </a>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {pageCount > 1 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <PaginationLink href={pageHref(page - 1)} disabled={page <= 1}>
            {labels.newest}
          </PaginationLink>
          <span className="font-mono text-[11px] text-subtle">
            {labels.pagination(page, pageCount)}
          </span>
          <PaginationLink
            href={pageHref(page + 1)}
            disabled={page >= pageCount}
          >
            {labels.oldest}
          </PaginationLink>
        </div>
      )}
    </section>
  );
}
