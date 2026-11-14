"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import {
  defaultLocale,
  isLocale,
  localeCookie,
  type Locale,
} from "@/lib/i18n/config";
import { commonContent } from "@/lib/i18n/common";

const subscribeToLocale = () => () => {};

function readLocaleCookie(): Locale {
  if (typeof document === "undefined") return defaultLocale;

  const match = document.cookie.match(new RegExp(`${localeCookie}=([^;]+)`));
  const value = match?.[1];

  return value && isLocale(value) ? value : defaultLocale;
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="mx-auto w-full max-w-6xl animate-pulse space-y-6 px-5 py-10"
    >
      <span className="sr-only">{label}</span>
      <div className="h-8 w-52 rounded-lg bg-surface-2" />
      <div className="h-4 w-80 max-w-full rounded bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-xl border border-border bg-surface"
          />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    readLocaleCookie,
    () => defaultLocale,
  );

  useEffect(() => {
    console.error(error);
  }, [error]);

  const content = commonContent[locale].error;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-lg flex-col items-center justify-center px-5 py-20 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">
        Error
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">
        {content.title}
      </h1>
      <p className="mt-3 text-sm text-muted">{content.body}</p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
        >
          <RotateCcw size={15} />
          {content.retry}
        </button>
        <Link
          href="/"
          className="text-sm text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand"
        >
          {content.home}
        </Link>
      </div>
    </div>
  );
}
