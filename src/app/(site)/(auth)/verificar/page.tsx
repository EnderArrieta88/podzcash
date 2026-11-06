import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { emailFingerprint, verifyEmailToken } from "@/lib/auth/email-token";
import { VerifyConfirm } from "@/components/auth/verify-confirm";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { getLocale } from "@/lib/i18n/locale";
import { authContent } from "@/lib/i18n/auth";

type PageProps = {
  searchParams: Promise<{
    token?: string | string[];
    email?: string | string[];
    sent?: string;
    ok?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: authContent[locale].verify.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function VerifyPage({ searchParams }: PageProps) {
  const locale = await getLocale();
  const content = authContent[locale].verify;
  const params = await searchParams;

  const rawToken = Array.isArray(params.token) ? params.token[0] : params.token;
  const token = rawToken?.trim() ?? "";
  const rawEmail = Array.isArray(params.email) ? params.email[0] : params.email;
  const email = rawEmail?.trim() ?? "";

  const payload = token ? verifyEmailToken(token) : null;
  const user = payload
    ? await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, status: true },
      })
    : null;

  const valid = Boolean(
    payload && user && emailFingerprint(user.email) === payload.emailFingerprint,
  );

  const success =
    params.ok === "1" || (valid && user?.status === "active");

  const confirmable = valid && user?.status === "unverified";

  if (success) {
    return (
      <div>
        <h1 className="font-display text-4xl tracking-tight">
          {content.successTitle}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {content.successBody}
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <Link
            href="/entrar"
            className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
          >
            {content.backToLogin}
          </Link>
        </div>
      </div>
    );
  }

  if (confirmable) {
    return (
      <div>
        <h1 className="font-display text-4xl tracking-tight">
          {content.confirmTitle}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {content.confirmBody}
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <VerifyConfirm token={token} labels={content} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight">
        {token ? content.invalidTitle : content.title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {token ? content.invalidBody : content.intro}
      </p>

      {params.sent === "1" && (
        <p className="mt-6 rounded-xl border border-jade/30 bg-jade-soft px-4 py-3 text-sm text-jade-bright">
          {content.sentBody}
        </p>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm font-medium">{content.resendTitle}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {content.resendIntro}
        </p>

        <div className="mt-5">
          <ResendVerificationForm labels={content} defaultEmail={email} />
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          <Link href="/entrar" className="text-brand hover:underline">
            {content.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  );
}
