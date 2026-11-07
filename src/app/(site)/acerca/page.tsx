import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/locale";
import { siteLegalContent } from "@/lib/i18n/legal";
import { socialMetadata } from "@/lib/seo";

const REPO_URL = "https://github.com/EnderArrieta88/podzcash";
const PROFILE_URL = "https://github.com/EnderArrieta88";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const content = siteLegalContent[locale].about;

  return {
    title: content.metaTitle,
    description: content.metaDescription,
    ...socialMetadata({
      title: content.metaTitle,
      description: content.metaDescription,
      path: "/acerca",
      locale,
      imageAlt: "PodZcash",
    }),
  };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const content = siteLegalContent[locale].about;

  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
        {content.eyebrow}
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
        {content.title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {content.intro}
      </p>

      <section className="mt-10">
        <h2 className="font-heading text-xl font-bold tracking-tight">
          {content.whatTitle}
        </h2>
        {content.whatBody.map((paragraph) => (
          <p
            key={paragraph}
            className="mt-3 text-sm leading-relaxed text-muted"
          >
            {paragraph}
          </p>
        ))}
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        {content.principles.map((principle) => (
          <div
            key={principle.title}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <p className="font-heading text-sm font-semibold">
              {principle.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {principle.body}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-10 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-heading text-lg font-bold tracking-tight">
          {content.teamTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {content.teamBody}
        </p>
        <p className="mt-4 text-sm font-medium">{content.teamName}</p>
        <p className="text-xs text-subtle">{content.teamRole}</p>
        <a
          href={PROFILE_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-2 inline-block text-sm text-brand hover:underline"
        >
          GitHub
        </a>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-bold tracking-tight">
          {content.statusTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {content.statusBody}
        </p>
        <Link
          href="/proyecto"
          className="mt-2 inline-block text-sm text-brand hover:underline"
        >
          {content.links.project}
        </Link>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-bold tracking-tight">
          {content.collaborateTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {content.collaborateBody}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="text-brand hover:underline"
          >
            {content.links.repository}
          </a>
          <a
            href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
            target="_blank"
            rel="noreferrer noopener"
            className="text-brand hover:underline"
          >
            {content.links.contributing}
          </a>
          <a
            href={`${REPO_URL}/blob/main/CODE_OF_CONDUCT.md`}
            target="_blank"
            rel="noreferrer noopener"
            className="text-brand hover:underline"
          >
            {content.links.conduct}
          </a>
          <a
            href={`${REPO_URL}/blob/main/SECURITY.md`}
            target="_blank"
            rel="noreferrer noopener"
            className="text-brand hover:underline"
          >
            {content.links.security}
          </a>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-jade/25 bg-jade-soft p-5">
        <h2 className="font-heading text-sm font-semibold text-jade-bright">
          {content.independenceTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-jade-bright/75">
          {content.independenceBody}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-bold tracking-tight">
          {content.contactTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {content.contactBody}
        </p>
        <a
          href="mailto:hola@podzcash.online"
          className="mt-2 inline-block text-sm text-brand hover:underline"
        >
          hola@podzcash.online
        </a>
      </section>

      <p className="mt-10 text-sm text-muted">
        <Link href="/" className="text-brand hover:underline">
          {content.backHome}
        </Link>
      </p>
    </article>
  );
}
