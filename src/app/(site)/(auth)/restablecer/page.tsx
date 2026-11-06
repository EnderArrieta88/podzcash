import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { verifyResetToken, passwordFingerprint } from "@/lib/auth/reset-token";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getLocale } from "@/lib/i18n/locale";
import { authContent } from "@/lib/i18n/auth";

type PageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: authContent[locale].reset.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const locale = await getLocale();
  const content = authContent[locale].reset;
  const params = await searchParams;
  const rawToken = Array.isArray(params.token) ? params.token[0] : params.token;
  const token = rawToken?.trim() ?? "";

  const payload = token ? verifyResetToken(token) : null;
  const user = payload
    ? await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, status: true, passwordHash: true },
      })
    : null;

  const valid =
    payload &&
    user &&
    user.status === "active" &&
    passwordFingerprint(user.passwordHash) === payload.passwordFingerprint;

  if (!valid) {
    return (
      <div>
        <h1 className="font-display text-4xl tracking-tight">
          {content.invalidTitle}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {content.invalidBody}
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <Link
            href="/recuperar"
            className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
          >
            {content.requestNew}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight">{content.title}</h1>
      <p className="mt-2 text-sm text-muted">{content.intro}</p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <ResetPasswordForm token={token} labels={content} />
      </div>
    </div>
  );
}
