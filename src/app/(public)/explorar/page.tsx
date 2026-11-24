import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, SearchX, ShieldCheck } from "lucide-react";
import { getChannels, getTopTags, searchCatalog } from "@/lib/catalog";
import { EpisodeCard } from "@/components/content/episode-card";
import { ChannelCard } from "@/components/content/channel-card";
import { SearchField } from "@/components/content/search-field";
import { cn } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/locale";
import { exploreContent } from "@/lib/i18n/explore";
import { socialMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const content = exploreContent[locale];

  return {
    title: content.meta.title,
    description: content.meta.description,
    ...socialMetadata({
      title: content.meta.title,
      description: content.meta.description,
      path: "/explorar",
      locale,
      imageAlt: "PodZcash",
    }),
  };
}

type QueryValue = string | string[] | undefined;

type SearchParams = Promise<{
  q?: QueryValue;
  tipo?: QueryValue;
  tag?: QueryValue;
}>;

function firstValue(value: QueryValue): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function buildHref(
  current: { q?: QueryValue; tipo?: QueryValue; tag?: QueryValue },
  patch: { tipo?: string | null; tag?: string | null },
) {
  const params = new URLSearchParams();
  const query = firstValue(current.q).trim();

  if (query) params.set("q", query);

  const tipo = patch.tipo === undefined ? firstValue(current.tipo) : patch.tipo;
  const tag = patch.tag === undefined ? firstValue(current.tag) : patch.tag;

  if (tipo) params.set("tipo", tipo);
  if (tag) params.set("tag", tag);

  const queryString = params.toString();
  return queryString ? `/explorar?${queryString}` : "/explorar";
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3.5 text-xs transition-colors",
        active
          ? "border-brand/50 bg-brand-soft font-medium text-brand"
          : "border-border bg-surface-2 text-muted hover:border-border-strong hover:text-text",
      )}
    >
      {children}
    </Link>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const content = exploreContent[locale];
  const query = firstValue(params.q).trim();
  const tipoRaw = firstValue(params.tipo);
  const tipo =
    tipoRaw === "podcast" || tipoRaw === "musica" ? tipoRaw : undefined;
  const tag = firstValue(params.tag).trim() || undefined;
  const kind =
    tipo === "musica" ? "music" : tipo === "podcast" ? "podcast" : undefined;

  const [results, tags, channels] = await Promise.all([
    searchCatalog({ query, kind, tag, limit: 32 }),
    getTopTags(10),
    getChannels(6),
  ]);

  const hasFilters = Boolean(query || tipo || tag);
  const activeTag = tag
    ? (tags.find((item) => item.slug === tag)?.name ?? tag)
    : null;
  const countLabel = query
    ? results.length === 1
      ? content.count.result
      : content.count.results
    : results.length === 1
      ? content.count.episode
      : content.count.episodes;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
            {content.eyebrow}
          </p>
          <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-tight">
            {content.title}
          </h1>
          <p className="mt-2 text-sm text-muted">{content.intro}</p>
        </div>

        <div className="w-full max-w-sm">
          <SearchField
            defaultValue={query}
            placeholder={content.search.placeholder}
            buttonLabel={content.search.button}
            ariaLabel={content.search.aria}
          />
        </div>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Chip href={buildHref(params, { tipo: null })} active={!tipo}>
              {content.filters.all}
            </Chip>
            <Chip
              href={buildHref(params, { tipo: "podcast" })}
              active={tipo === "podcast"}
            >
              {content.filters.podcasts}
            </Chip>
            <Chip
              href={buildHref(params, { tipo: "musica" })}
              active={tipo === "musica"}
            >
              {content.filters.music}
            </Chip>

            {tags.length > 0 && (
              <span className="mx-1 hidden h-4 w-px bg-border sm:block" />
            )}

            {tags.map((item) => (
              <Chip
                key={item.id}
                href={buildHref(params, {
                  tag: tag === item.slug ? null : item.slug,
                })}
                active={tag === item.slug}
              >
                {item.name}
              </Chip>
            ))}
          </div>

          <div className="mt-7 flex items-baseline justify-between gap-4">
            <p className="text-sm text-muted">
              {query ? (
                <>
                  {results.length} {countLabel} {content.count.for}{" "}
                  <span className="text-text">&quot;{query}&quot;</span>
                </>
              ) : (
                <>
                  {results.length} {countLabel}
                </>
              )}
              {activeTag && (
                <span className="text-subtle">
                  {" "}
                  · {content.count.tag} {activeTag}
                </span>
              )}
            </p>

            {hasFilters && (
              <Link
                href="/explorar"
                className="shrink-0 text-xs text-subtle underline-offset-2 hover:text-text hover:underline"
              >
                {content.clear}
              </Link>
            )}
          </div>

          {results.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
              {results.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-2 text-subtle">
                <SearchX size={20} />
              </span>
              <p className="mt-4 font-heading text-sm font-semibold">
                {query ? content.empty.noResults : content.empty.silence}
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
                {query
                  ? content.empty.noResultsBody
                  : content.empty.silenceBody}
              </p>
              {hasFilters && (
                <Link
                  href="/explorar"
                  className="mt-5 inline-flex h-9 items-center rounded-xl border border-border bg-surface-2 px-4 text-sm transition-colors hover:bg-surface-3"
                >
                  {content.empty.viewAll}
                </Link>
              )}
            </div>
          )}
        </div>

        <aside className="hidden space-y-4 xl:block">
          {channels.length > 0 && (
            <Panel
              title={content.panels.channels}
              action={
                <Link
                  href="/explorar"
                  aria-label={content.panels.channels}
                  className="text-subtle hover:text-text"
                >
                  <ArrowRight size={14} />
                </Link>
              }
            >
              <div className="space-y-1">
                {channels.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    locale={locale}
                  />
                ))}
              </div>
            </Panel>
          )}

          {tags.length > 0 && (
            <Panel title={content.panels.tags}>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((item) => (
                  <Link
                    key={item.id}
                    href={buildHref(params, { tag: item.slug })}
                    className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-brand/40 hover:text-brand"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </Panel>
          )}

          <div className="rounded-xl border border-jade/25 bg-jade-soft p-4">
            <ShieldCheck size={18} className="text-jade-bright" />
            <p className="mt-2 font-heading text-sm font-semibold text-jade-bright">
              {content.support.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-jade-bright/70">
              {content.support.body}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
