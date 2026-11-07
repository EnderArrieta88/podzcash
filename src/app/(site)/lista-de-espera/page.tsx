import type { Metadata } from "next";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";
import { getLocale } from "@/lib/i18n/locale";
import { waitlistContent } from "@/lib/i18n/waitlist";
import { socialMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const content = waitlistContent[locale];

  return {
    title: content.metaTitle,
    description: content.metaDescription,
    ...socialMetadata({
      title: content.metaTitle,
      description: content.metaDescription,
      path: "/lista-de-espera",
      locale,
      imageAlt: "PodZcash",
    }),
  };
}

export default async function WaitlistPage() {
  const locale = await getLocale();
  const content = waitlistContent[locale];

  return (
    <article className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
        {content.eyebrow}
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
        {content.title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{content.intro}</p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <WaitlistForm labels={content} />
      </div>

      <p className="mt-5 text-xs leading-relaxed text-subtle">
        {content.privacy}
      </p>
    </article>
  );
}
