import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import {
  countUnreadChannelComments,
  listChannelComments,
} from "@/features/comments/queries";
import { pageParam } from "@/lib/pagination";
import { isEmailConfigured } from "@/lib/email";
import { formatDate } from "@/lib/format";
import { getLocale } from "@/lib/i18n/locale";
import { studioCommentsContent } from "@/lib/i18n/studio-comments";
import { episodePath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { DeleteCommentButton } from "@/features/comments/components/delete-comment-button";
import { MarkCommentsSeen } from "@/features/comments/components/mark-comments-seen";
import { setCommentNotifyAction } from "@/features/comments/actions";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return { title: studioCommentsContent[locale].metaTitle };
}

export default async function StudioCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    pagina?: string | string[];
    saved?: string;
  }>;
}) {
  const [user, locale, query] = await Promise.all([
    requireUser(),
    getLocale(),
    searchParams,
  ]);

  if (!user.channel) redirect("/estudio/canal");

  const content = studioCommentsContent[locale];
  const channel = user.channel;
  const page = pageParam(query.pagina);

  const [data, unread] = await Promise.all([
    listChannelComments(channel.id, page),
    countUnreadChannelComments(channel),
  ]);

  const pageHref = (value: number) => `/estudio/comentarios?pagina=${value}`;
  const emailReady = isEmailConfigured();

  return (
    <div className="space-y-6">
      <MarkCommentsSeen />

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {content.title}
        </h1>
        <p className="mt-2 text-sm text-muted">{content.intro}</p>
        {unread > 0 && (
          <p className="mt-2 inline-flex rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
            {content.newComments(unread)}
          </p>
        )}
      </div>

      {query.saved && (
        <p className="rounded-[10px] border border-success/30 bg-success/10 px-3.5 py-2.5 text-sm text-success">
          {content.settings.saved}
        </p>
      )}

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-heading text-sm font-semibold">
          {content.settings.title}
        </h2>

        <form
          action={setCommentNotifyAction}
          className="mt-3 flex flex-wrap items-end gap-3"
        >
          <label className="min-w-56 flex-1 text-sm">
            <span className="mb-1.5 block text-muted">
              {content.settings.label}
            </span>
            <select
              name="commentNotify"
              defaultValue={channel.commentNotify}
              className="h-10 w-full rounded-[10px] border border-border bg-surface-2 px-3 text-sm text-text outline-none focus:border-brand"
            >
              {["inbox", "email", "off"].map((value) => (
                <option key={value} value={value}>
                  {content.settings.options[value]}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-full bg-brand px-4 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
          >
            {content.settings.save}
          </button>
        </form>

        <p className="mt-3 text-xs leading-relaxed text-subtle">
          {channel.commentNotify === "email"
            ? content.settings.emailHint
            : content.settings.inboxHint}
        </p>

        {!emailReady && (
          <p className="mt-2 text-xs text-subtle">
            {content.settings.emailNotConfigured}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <MessageSquare size={15} className="text-brand" />
          <h2 className="font-heading text-sm font-semibold">
            {content.title}
          </h2>
          <span className="ml-auto font-mono text-[11px] text-subtle">
            {data.total}
          </span>
        </div>

        {data.items.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">{content.empty}</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.items.map((comment) => {
              const episodeHref =
                comment.episode.status === "published"
                  ? episodePath(channel.handle, comment.episode.slug)
                  : `/estudio/episodios/${comment.episode.id}`;

              return (
                <li key={comment.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">{comment.user.name}</p>
                    <span className="font-mono text-[11px] text-subtle">
                      {formatDate(comment.createdAt, locale)}
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs text-subtle">
                    {content.on}{" "}
                    <Link
                      href={episodeHref}
                      className="text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand"
                    >
                      {comment.episode.title}
                    </Link>
                  </p>

                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                    {comment.body}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    <Link
                      href={episodeHref}
                      className="text-xs text-subtle transition-colors hover:text-text"
                    >
                      {content.viewEpisode}
                    </Link>

                    <DeleteCommentButton
                      id={comment.id}
                      path="/estudio/comentarios"
                      label={content.delete}
                      confirmLabel={content.deleteConfirm}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {data.pageCount > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
            <Link
              href={pageHref(data.page - 1)}
              aria-disabled={data.page <= 1}
              className={cn(
                "inline-flex h-8 items-center rounded-full border border-border bg-surface-2 px-3 text-xs transition-colors",
                data.page <= 1
                  ? "pointer-events-none text-subtle/50"
                  : "text-muted hover:text-text",
              )}
            >
              {content.pagination.previous}
            </Link>
            <span className="font-mono text-[11px] text-subtle">
              {content.pagination.page(data.page, data.pageCount)}
            </span>
            <Link
              href={pageHref(data.page + 1)}
              aria-disabled={data.page >= data.pageCount}
              className={cn(
                "inline-flex h-8 items-center rounded-full border border-border bg-surface-2 px-3 text-xs transition-colors",
                data.page >= data.pageCount
                  ? "pointer-events-none text-subtle/50"
                  : "text-muted hover:text-text",
              )}
            >
              {content.pagination.next}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
