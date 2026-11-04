import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
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
          ? "border-brand/40 bg-brand-soft/70 text-brand"
          : "border-border text-muted hover:border-border-strong hover:text-text",
      )}
    >
      {children}
    </Link>
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const tipo = params.tipo === "podcast" || params.tipo === "musica" ? params.tipo : undefined;
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
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
          Explorar
        </h1>
        <p className="mt-2 text-sm text-muted">
          Todo el podcast y la música del ecosistema Zcash, en un solo lugar.
        </p>

        <div className="mt-6">
          <SearchField defaultValue={query} />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-2">
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
            href={buildHref(params, { tag: tag === item.slug ? null : item.slug })}
            active={tag === item.slug}
          >
            {item.name}
          </Chip>
        ))}
      </div>

      <div className="mt-8 flex items-baseline justify-between gap-4">
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
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-2 text-subtle">
            <SearchX size={20} />
          </span>
          <p className="mt-4 text-sm font-medium">
            {query ? "Sin resultados" : "Todavía no hay episodios publicados"}
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
            {query
              ? "Prueba con otra palabra, quita filtros o busca por el nombre del canal."
              : "Cuando los creadores publiquen, todo va a aparecer acá."}
          </p>
          {hasFilters && (
            <Link
              href="/explorar"
              className="mt-5 inline-flex h-9 items-center rounded-full border border-border bg-surface-2 px-4 text-sm transition-colors hover:bg-border"
            >
              Ver todo
            </Link>
          )}
        </div>
      )}

      {!hasFilters && channels.length > 0 && (
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl tracking-tight">Canales</h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
