import type { Metadata } from "next";
import { Download } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { Input, Label } from "@/components/ui/field";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { DeleteAccountForm } from "@/components/studio/delete-account-form";
import { changePasswordAction, clearPlaybackHistoryAction } from "../actions";
import { getLocale } from "@/lib/i18n/locale";
import { studioAccountContent } from "@/lib/i18n/studio-account";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return { title: studioAccountContent[locale].metaTitle };
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; historial?: string }>;
}) {
  const [user, locale, params] = await Promise.all([
    requireUser(),
    getLocale(),
    searchParams,
  ]);
  const content = studioAccountContent[locale];

  const errorKey = params.error;
  const error =
    errorKey === "invalid" || errorKey === "current" || errorKey === "same"
      ? content.errors[errorKey]
      : errorKey
        ? content.errors.generic
        : null;
  const done = params.ok === "1";

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-bold tracking-tight">
        {content.title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {content.signedInAs} <span className="text-text">{user.email}</span>.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-heading text-sm font-semibold">
          {content.changeTitle}
        </h2>
        <p className="mt-1 text-xs text-muted">{content.changeHint}</p>

        {done && (
          <p className="mt-4 rounded-xl border border-jade/30 bg-jade-soft px-4 py-2.5 text-sm text-jade-bright">
            {content.done}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <form action={changePasswordAction} className="mt-5 space-y-5">
          <div>
            <Label htmlFor="currentPassword">{content.currentPassword}</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <div>
            <Label htmlFor="newPassword">{content.newPassword}</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">{content.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="border-t border-border pt-5">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-medium text-[#17130a] transition-colors hover:bg-brand-strong disabled:opacity-60"
            >
              {content.submit}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-heading text-sm font-semibold">
          {content.exportTitle}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {content.exportBody}
        </p>

        <a
          href="/estudio/cuenta/exportar"
          className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-surface-2 px-5 text-sm text-text transition-colors hover:bg-surface-3"
        >
          <Download size={14} />
          {content.exportButton}
        </a>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-heading text-sm font-semibold">
          {content.historyTitle}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {content.historyBody}
        </p>

        {params.historial === "1" && (
          <p className="mt-4 rounded-xl border border-jade/30 bg-jade-soft px-4 py-2.5 text-sm text-jade-bright">
            {content.historyCleared}
          </p>
        )}

        <form action={clearPlaybackHistoryAction} className="mt-4">
          <ConfirmButton
            label={content.historyClear}
            confirmLabel={content.historyConfirm}
            className="inline-flex h-10 items-center justify-center rounded-full border border-danger/40 bg-danger/10 px-5 text-sm text-danger transition-colors hover:bg-danger/20"
          />
        </form>
      </div>

      <div className="mt-6 rounded-xl border border-danger/30 bg-danger/5 p-6">
        <h2 className="font-heading text-sm font-semibold text-danger">
          {content.deleteTitle}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {content.deleteBody}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-subtle">
          {content.deleteWarning}
        </p>

        <DeleteAccountForm email={user.email} labels={content.delete} />
      </div>
    </div>
  );
}
