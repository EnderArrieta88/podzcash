import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flag } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Label, Textarea } from "@/components/ui/field";
import { getLocale } from "@/lib/i18n/locale";
import { commentReportContent } from "@/lib/i18n/comment-report";
import { episodePath } from "@/lib/routes";
import { submitCommentReportAction } from "@/features/moderation/actions";
import { getReportableComment } from "@/features/moderation/queries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: commentReportContent[locale].metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function ReportCommentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const [{ id }, query, locale] = await Promise.all([
    params,
    searchParams,
    getLocale(),
  ]);
  const content = commentReportContent[locale];

  const comment = await getReportableComment(id);

  if (!comment) notFound();

  const viewer = await getCurrentUser();
  const backPath = episodePath(
    comment.episode.channel.handle,
    comment.episode.slug,
  );

  const errorMessage =
    query.error === "limit"
      ? content.errors.limit
      : query.error === "own"
        ? content.errors.own
        : query.error === "duplicate"
          ? content.errors.duplicate
          : query.error
            ? content.errors.invalid
            : null;

  return (
    <div className="mx-auto w-full max-w-xl">
      <Link
        href={backPath}
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={15} />
        {content.back}
      </Link>

      <div className="mt-5 flex items-center gap-2">
        <Flag size={16} className="text-brand" />
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {content.title}
        </h1>
      </div>

      <p className="mt-2 text-sm text-muted">
        {content.context(comment.user.name, comment.episode.title)}
      </p>

      <blockquote className="mt-4 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm leading-relaxed text-muted">
        {comment.body}
      </blockquote>

      {!viewer ? (
        <div className="mt-6 rounded-xl border border-border bg-surface p-6 text-sm text-muted">
          {content.loginPrompt}{" "}
          <Link href="/entrar" className="text-brand hover:underline">
            {content.loginLink}
          </Link>
        </div>
      ) : query.ok === "1" ? (
        <div className="mt-6 rounded-xl border border-jade/30 bg-jade-soft px-4 py-3 text-sm text-jade-bright">
          {content.thanks}
        </div>
      ) : (
        <form
          action={submitCommentReportAction}
          className="mt-6 space-y-5 rounded-xl border border-border bg-surface p-6"
        >
          <input type="hidden" name="commentId" value={comment.id} />

          {errorMessage && (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
              {errorMessage}
            </p>
          )}

          <div>
            <Label htmlFor="reason">{content.reason}</Label>
            <select
              id="reason"
              name="reason"
              required
              defaultValue=""
              className="h-11 w-full rounded-[10px] border border-border bg-surface-2 px-3 text-sm text-text outline-none focus:border-brand"
            >
              <option value="" disabled>
                {content.reasonPlaceholder}
              </option>
              {content.reasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="details">{content.details}</Label>
            <Textarea
              id="details"
              name="details"
              rows={4}
              maxLength={1000}
              placeholder={content.detailsPlaceholder}
            />
          </div>

          <div className="border-t border-border pt-4">
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-medium text-[#17130a] transition-colors hover:bg-brand-strong"
            >
              {content.submit}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
