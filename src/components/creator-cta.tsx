import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { commonContent } from "@/lib/i18n/common";

export function CreatorCta({ locale }: { locale: Locale }) {
  const content = commonContent[locale].creatorCta;

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-brand/25 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(244,183,40,0.16),rgba(16,185,129,0.05)_55%,transparent_80%)] p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand">
            {content.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {content.body}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/lista-de-espera"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
          >
            {content.primary}
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/proyecto"
            className="inline-flex h-10 items-center rounded-full border border-border bg-surface-2 px-5 text-sm text-text transition-colors hover:bg-surface-3"
          >
            {content.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
