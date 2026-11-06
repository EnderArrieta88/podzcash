import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { RegisterForm } from "@/components/auth/register-form";
import { getLocale } from "@/lib/i18n/locale";
import { authContent } from "@/lib/i18n/auth";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return { title: authContent[locale].register.metaTitle };
}

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/estudio");

  const firstUser = (await prisma.user.count()) === 0;
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
        <RegisterForm firstUser={firstUser} labels={content} />
      </div>

      {!firstUser && (
        <p className="mt-4 text-center text-sm text-muted">
          {content.waitlistPrompt}{" "}
          <Link href="/lista-de-espera" className="text-brand hover:underline">
            {content.waitlistLink}
          </Link>
        </p>
      )}
    </div>
  );
}
