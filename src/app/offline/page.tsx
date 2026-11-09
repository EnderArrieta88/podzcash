import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { getLocale } from "@/lib/i18n/locale";
import { offlineContent } from "@/lib/i18n/offline";
import { OfflineRetry } from "@/components/pwa/offline-retry";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: offlineContent[locale].title,
    robots: { index: false, follow: false },
  };
}

export default async function OfflinePage() {
  const locale = await getLocale();
  const content = offlineContent[locale];

  return (
    <main
      id="offline"
      className="flex min-h-dvh items-center justify-center px-6 py-16"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <WifiOff size={24} />
        </span>

        <h1 className="mt-5 font-display text-3xl tracking-tight">
          {content.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{content.body}</p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <OfflineRetry label={content.retry} />
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full border border-border bg-surface-2 px-5 text-sm text-muted transition-colors hover:text-text"
          >
            {content.home}
          </Link>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-subtle">
          {content.hint}
        </p>
      </div>
    </main>
  );
}
