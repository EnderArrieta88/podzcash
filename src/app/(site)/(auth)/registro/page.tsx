import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { RegisterForm } from "@/features/auth/components/register-form";
import { isFirstUser } from "@/features/auth/queries";
import { getLocale } from "@/lib/i18n/locale";
import { authContent } from "@/lib/i18n/auth";
import { formatInviteCode, normalizeInviteCode } from "@/lib/links";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return { title: authContent[locale].register.metaTitle };
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/estudio");

  const params = await searchParams;
  const rawInvite = Array.isArray(params.invite)
    ? params.invite[0]
    : params.invite;
  const defaultInvite =
    rawInvite && normalizeInviteCode(rawInvite)
      ? formatInviteCode(rawInvite)
      : "";

  const firstUser = await isFirstUser();
  const locale = await getLocale();
  const content = authContent[locale].register;

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight">
        {firstUser ? content.firstTitle : content.title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {firstUser ? content.firstIntro : content.intro}
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <RegisterForm
          firstUser={firstUser}
          labels={content}
          defaultInvite={defaultInvite}
        />
      </div>

      {!firstUser && (
        <p className="mt-4 text-center text-sm text-muted">
          {content.waitlistPrompt}{" "}
          <Link
            href="/lista-de-espera"
            className="text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand"
          >
            {content.waitlistLink}
          </Link>
        </p>
      )}
    </div>
  );
}
