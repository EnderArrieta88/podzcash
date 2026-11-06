import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ResetRequestForm } from "@/components/auth/reset-request-form";
import { getLocale } from "@/lib/i18n/locale";
import { authContent } from "@/lib/i18n/auth";

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

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight">{content.title}</h1>
      <p className="mt-2 text-sm text-muted">{content.intro}</p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <ResetRequestForm labels={content} />
      </div>
    </div>
  );
}
