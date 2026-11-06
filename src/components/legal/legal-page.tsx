import Link from "next/link";
import type { LegalDocument } from "@/lib/i18n/legal";

export function LegalPage({ content }: { content: LegalDocument }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
        {content.updated}
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">
        {content.title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{content.intro}</p>

      <div className="mt-10 space-y-8">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-heading text-lg font-bold tracking-tight">
              {section.title}
            </h2>

            {section.paragraphs?.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-2 text-sm leading-relaxed text-muted"
              >
                {paragraph}
              </p>
            ))}

            {section.bullets && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-heading text-sm font-semibold">
          {content.contactTitle}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {content.contactBody}
        </p>
        <a
          href="mailto:hola@podzcash.online"
          className="mt-2 inline-block text-sm text-brand hover:underline"
        >
          hola@podzcash.online
        </a>
      </section>

      <p className="mt-8 text-sm text-muted">
        <Link href="/" className="text-brand hover:underline">
          {content.backHome}
        </Link>
      </p>
    </article>
  );
}
