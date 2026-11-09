import type { Metadata } from "next";
import Link from "next/link";
import { UserRoundX } from "lucide-react";
import { getLocale } from "@/lib/i18n/locale";
import { accountDeletedContent } from "@/lib/i18n/account-deleted";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: accountDeletedContent[locale].title,
    robots: { index: false, follow: false },
  };
}

export default async function AccountDeletedPage() {
  const locale = await getLocale();
  const content = accountDeletedContent[locale];

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-muted">
          <UserRoundX size={24} />
        </span>

        <h1 className="mt-5 font-display text-3xl tracking-tight">
          {content.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{content.body}</p>

        <Link
          href="/"
          className="mt-7 inline-flex h-10 items-center rounded-full border border-border bg-surface-2 px-5 text-sm text-muted transition-colors hover:text-text"
        >
          {content.home}
        </Link>
      </div>
    </div>
  );
}
