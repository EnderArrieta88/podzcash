import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ResetRequestForm } from "@/features/auth/components/reset-request-form";
import { getLocale } from "@/lib/i18n/locale";
import { authContent } from "@/lib/i18n/auth";
import { isEmailConfigured } from "@/lib/email";
import { isResetTokenConfigured } from "@/lib/auth/reset-token";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: authContent[locale].resetRequest.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function ResetRequestPage() {
  const user = await getCurrentUser();
  if (user) redirect("/estudio");

  const locale = await getLocale();
  const content = authContent[locale].resetRequest;
  const enabled =
    (isEmailConfigured() && isResetTokenConfigured()) ||
    process.env.NODE_ENV !== "production";

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight">{content.title}</h1>
      <p className="mt-2 text-sm text-muted">{content.intro}</p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        {enabled ? (
          <ResetRequestForm labels={content} />
        ) : (
          <div>
            <p className="text-sm font-medium">{content.unavailableTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {content.unavailableBody}
            </p>
            <Link
              href="/entrar"
              className="mt-4 inline-block text-sm text-brand hover:underline"
            >
              {content.backToLogin}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
