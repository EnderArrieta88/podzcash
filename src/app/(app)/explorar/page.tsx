import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, SearchX, ShieldCheck } from "lucide-react";
import { getChannels, getTopTags, searchCatalog } from "@/lib/catalog";
import { EpisodeCard } from "@/components/content/episode-card";
import { ChannelCard } from "@/components/content/channel-card";
import { SearchField } from "@/components/content/search-field";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Explorar",
  description:
    "Descubre podcasts y música del ecosistema Zcash. Busca por título, canal o etiqueta.",
};

type SearchParams = Promise<{ q?: string; tipo?: string; tag?: string }>;

function buildHref(
  current: { q?: string; tipo?: string; tag?: string },
  patch: { tipo?: string | null; tag?: string | null },
) {
  const params = new URLSearchParams();

  if (current.q?.trim()) params.set("q", current.q.trim());

  const tipo = patch.tipo === undefined ? current.tipo : patch.tipo;
  const tag = patch.tag === undefined ? current.tag : patch.tag;

  if (tipo) params.set("tipo", tipo);
  if (tag) params.set("tag", tag);

  const query = params.toString();
  return query ? `/explorar?${query}` : "/explorar";
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
  const query = (params.q ?? "").trim();
  const tipo =
    params.tipo === "podcast" || params.tipo === "musica" ? params.tipo : undefined;
  const tag = params.tag?.trim() || undefined;
  const kind = tipo === "musica" ? "music" : tipo === "podcast" ? "podcast" : undefined;

  const [results, tags, channels] = await Promise.all([
    searchCatalog({ query, kind, tag, limit: 32 }),
    getTopTags(10),
    getChannels(6),
  ]);

  const hasFilters = Boolean(query || tipo || tag);
  const activeTag = tag
    ? tags.find((item) => item.slug === tag)?.name ?? tag
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
            Catálogo
          </p>
          <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-tight">
            Explorar
          </h1>
          <p className="mt-2 text-sm text-muted">
            Todo el podcast y la música del ecosistema Zcash, en un solo lugar.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <SearchField defaultValue={query} />
        </div>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Chip href={buildHref(params, { tipo: null })} active={!tipo}>
              Todo
            </Chip>
            <Chip
              href={buildHref(params, { tipo: "podcast" })}
              active={tipo === "podcast"}
            >
              Podcasts
            </Chip>
            <Chip
              href={buildHref(params, { tipo: "musica" })}
              active={tipo === "musica"}
            >
              Música
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
                  {results.length}{" "}
                  {results.length === 1 ? "resultado" : "resultados"} para{" "}
                  <span className="text-text">“{query}”</span>
                </>
              ) : (
                <>
                  {results.length}{" "}
                  {results.length === 1 ? "episodio" : "episodios"}
                </>
              )}
              {activeTag && (
                <span className="text-subtle"> · etiqueta {activeTag}</span>
              )}
            </p>

            {hasFilters && (
              <Link
                href="/explorar"
                className="shrink-0 text-xs text-subtle underline-offset-2 hover:text-text hover:underline"
              >
                Limpiar filtros
              </Link>
            )}
          </div>

          {results.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
              {results.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-2 text-subtle">
                <SearchX size={20} />
              </span>
              <p className="mt-4 font-heading text-sm font-semibold">
                {query ? "Sin resultados" : "Silencio en el estudio"}
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
                {query
                  ? "Prueba con otra palabra, quita filtros o busca por el nombre del canal."
                  : "Cuando los creadores publiquen, todo va a aparecer acá."}
              </p>
              {hasFilters && (
                <Link
                  href="/explorar"
                  className="mt-5 inline-flex h-9 items-center rounded-xl border border-border bg-surface-2 px-4 text-sm transition-colors hover:bg-surface-3"
                >
                  Ver todo
                </Link>
              )}
            </div>
          )}
        </div>

        <aside className="hidden space-y-4 xl:block">
          {channels.length > 0 && (
            <Panel
              title="Canales"
              action={
                <Link href="/explorar" className="text-subtle hover:text-text">
                  <ArrowRight size={14} />
                </Link>
              }
            >
              <div className="space-y-1">
                {channels.map((channel) => (
                  <ChannelCard key={channel.id} channel={channel} />
                ))}
              </div>
            </Panel>
          )}

          {tags.length > 0 && (
            <Panel title="Etiquetas">
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
              Apoyá directo
            </p>
            <p className="mt-1 text-xs leading-relaxed text-jade-bright/70">
              Las donaciones van de wallet a wallet. PodZcash nunca retiene los
              fondos.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
