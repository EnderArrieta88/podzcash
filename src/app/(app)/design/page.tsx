import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Check,
  Heart,
  Mic2,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getLatestEpisodes } from "@/lib/catalog";
import { formatDuration } from "@/lib/format";
import { storage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { episodePath } from "@/lib/routes";
import { getFeaturedChannel } from "@/features/channels/queries";

export const metadata: Metadata = { title: "Sistema de diseño" };

const colors = [
  { name: "bg", value: "#0B0D11", note: "Lienzo" },
  { name: "surface", value: "#111317", note: "Plancha base" },
  { name: "surface-2", value: "#1A1C20", note: "Hover / inputs" },
  { name: "surface-3", value: "#1E2024", note: "Deck elevado" },
  { name: "surface-4", value: "#282A2E", note: "Activo" },
  { name: "border", value: "#282E3A", note: "Hairline" },
  { name: "brand", value: "#F4B728", note: "Señal / play" },
  { name: "jade", value: "#10B981", note: "Protegido / verificado" },
  { name: "text", value: "#E6E7EC", note: "Títulos" },
  { name: "muted", value: "#94A3B8", note: "Metadata" },
  { name: "subtle", value: "#64748B", note: "Terciario" },
  { name: "danger", value: "#EF4444", note: "Error" },
];

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-10 first:border-t-0 first:pt-0">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-heading text-xl font-bold tracking-tight">{title}</h2>
        {hint && <p className="font-mono text-[11px] text-subtle">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export default async function DesignPage() {
  // Laboratorio de diseño: solo existe en desarrollo.
  if (process.env.NODE_ENV === "production") notFound();

  const [episodes, channel] = await Promise.all([
    getLatestEpisodes(4),
    getFeaturedChannel(),
  ]);

  const featured = episodes[0];

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-jade">
          <Sparkles size={13} />
          Obsidian Cipher · adaptado a PodZcash
        </p>
        <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight">
          Sistema de diseño
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Laboratorio local para aprobar tokens y componentes antes de aplicarlos
          a las páginas reales.
        </p>
      </header>

      <Section title="Color" hint="profundidad por luminancia, sin sombras">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {colors.map((color) => (
            <div
              key={color.name}
              className="overflow-hidden rounded-xl border border-border bg-surface"
            >
              <div
                className="h-16 w-full"
                style={{ backgroundColor: color.value }}
              />
              <div className="p-3">
                <p className="font-mono text-[11px] text-text">{color.name}</p>
                <p className="font-mono text-[10px] text-subtle">{color.value}</p>
                <p className="mt-1 text-[11px] text-muted">{color.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografía" hint="Jakarta · Inter · Instrument Serif · Space Mono">
        <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              Display editorial · Instrument Serif
            </p>
            <p className="mt-2 font-display text-5xl leading-none">
              Custodia propia
            </p>
          </div>

          <div className="border-t border-border pt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              Heading · Plus Jakarta Sans
            </p>
            <p className="mt-2 font-heading text-3xl font-extrabold tracking-tight">
              El hogar de los podcasts
            </p>
            <p className="mt-1 font-heading text-xl font-bold">
              Título de sección
            </p>
          </div>

          <div className="border-t border-border pt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              Body · Inter
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Publica tu contenido, construye tu audiencia y recibe donaciones
              directas en ZEC. Sin intermediarios, sin custodia y sin pedirle
              permiso a nadie.
            </p>
          </div>

          <div className="border-t border-border pt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              Datos · Space Mono
            </p>
            <p className="mt-2 font-mono text-sm tabular text-text">
              48:15 · 342.6 ZEC · zs1…3f8a
            </p>
          </div>
        </div>
      </Section>

      <Section title="Acciones y estados" hint="ámbar = acción · jade = protegido">
        <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
            >
              <Play size={15} fill="currentColor" />
              Reproducir
            </button>

            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-jade/30 bg-jade-soft px-5 text-sm font-medium text-jade-bright transition-colors hover:border-jade/60"
            >
              <ShieldCheck size={15} />
              Apoyar con ZEC
            </button>

            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface-2 px-5 text-sm text-text transition-colors hover:bg-surface-3"
            >
              Secundario
            </button>

            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-text"
              aria-label="Me gusta"
            >
              <Heart size={16} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-5">
            <span className="rounded-full border border-brand/40 bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
              Todo
            </span>
            <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted">
              Podcasts
            </span>
            <span className="rounded-full border border-jade/30 bg-jade-soft px-3 py-1 font-mono text-[11px] text-jade-bright">
              <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-jade align-middle" />
              Protegido
            </span>
            <span className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-subtle">
              ZEC sin custodia
            </span>
          </div>
        </div>
      </Section>

      {featured && (
        <Section title="Tarjeta de episodio" hint="portada dominante, sin bordes de más">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {episodes.map((episode) => {
              const cover = episode.coverKey
                ? storage.url(episode.coverKey)
                : null;

              return (
                <article key={episode.id} className="group">
                  <div className="relative">
                    <Link
                      href={episodePath(episode.channel.handle, episode.slug)}
                      className="block aspect-square overflow-hidden rounded-xl border border-border bg-surface-2"
                    >
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt=""
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center text-subtle">
                          <Mic2 size={24} />
                        </span>
                      )}
                    </Link>

                    <span className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-brand text-[#17130a] opacity-100 shadow-[0_0_24px_rgba(244,183,40,0.35)] transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      <Play size={14} fill="currentColor" className="ml-0.5" />
                    </span>
                  </div>

                  <Link href={episodePath(episode.channel.handle, episode.slug)}>
                    <h3 className="mt-3 line-clamp-2 font-heading text-sm font-semibold leading-snug transition-colors group-hover:text-brand">
                      {episode.title}
                    </h3>
                  </Link>
                  <p className="mt-1 truncate text-xs text-muted">
                    {episode.channel.displayName}
                  </p>
                  <p className="mt-1 font-mono text-[11px] tabular text-subtle">
                    {episode.kind === "music" ? "MÚSICA" : "PODCAST"} ·{" "}
                    {formatDuration(episode.durationSec)}
                  </p>
                </article>
              );
            })}
          </div>
        </Section>
      )}

      {channel && (
        <Section title="Cabecera de canal" hint="serif solo en el nombre">
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="relative h-40 bg-gradient-to-br from-brand/25 via-brand-soft to-surface" />
            <div className="px-6 pb-6">
              <div className="-mt-12 flex items-end gap-4">
                {channel.avatarKey ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={storage.url(channel.avatarKey)}
                    alt=""
                    className="size-24 rounded-full border-4 border-surface object-cover"
                  />
                ) : (
                  <span className="flex size-24 items-center justify-center rounded-full border-4 border-surface bg-brand-soft font-display text-3xl text-brand">
                    {channel.displayName.slice(0, 1)}
                  </span>
                )}

                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-jade/30 bg-jade-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-jade-bright">
                    Canal Zcash
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] text-subtle">
                    {channel._count.episodes} episodios
                  </span>
                </div>

                <button
                  type="button"
                  className="mb-1 ml-auto inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-[#17130a]"
                >
                  <ShieldCheck size={15} />
                  Apoyar
                </button>
              </div>

              <h3 className="mt-4 font-display text-5xl leading-none tracking-tight">
                {channel.displayName}
              </h3>
              <p className="mt-2 font-mono text-xs text-subtle">
                @{channel.handle}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                {channel.bio ?? "Sin bio todavía."}
              </p>
            </div>
          </div>
        </Section>
      )}

      <Section title="Fila de audio" hint="densa, con números tabulares">
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {episodes.map((episode, index) => (
            <li
              key={episode.id}
              className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-2"
            >
              <span className="w-6 shrink-0 text-center font-mono text-xs text-subtle group-hover:hidden">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="hidden w-6 shrink-0 text-brand group-hover:block">
                <Play size={14} fill="currentColor" />
              </span>

              <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
                {episode.coverKey ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={storage.url(episode.coverKey)}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-subtle">
                    <Mic2 size={16} />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{episode.title}</p>
                <p className="truncate text-xs text-muted">
                  {episode.channel.displayName}
                </p>
              </div>

              <span className="hidden font-mono text-[11px] tabular text-subtle sm:block">
                {formatDuration(episode.durationSec)}
              </span>

              <span className="rounded-full border border-jade/25 bg-jade-soft px-2 py-0.5 font-mono text-[10px] text-jade-bright">
                ZEC
              </span>

              <button
                type="button"
                className="text-subtle transition-colors hover:text-danger"
                aria-label="Me gusta"
              >
                <Heart size={15} />
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Estados vacíos" hint="tono de locución, no de dashboard">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
            <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-surface-2 text-subtle">
              <Mic2 size={18} />
            </span>
            <p className="mt-4 font-heading text-sm font-semibold">
              Silencio en el estudio
            </p>
            <p className="mx-auto mt-1.5 max-w-xs text-xs text-muted">
              Cuando el creador publique, su primer episodio aparece aquí.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
            <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-jade-soft text-jade-bright">
              <Check size={18} />
            </span>
            <p className="mt-4 font-heading text-sm font-semibold">
              Todo al día
            </p>
            <p className="mx-auto mt-1.5 max-w-xs text-xs text-muted">
              No hay nada pendiente. Tu canal está listo para publicar.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Barra del reproductor" hint="vidrio + línea de progreso">
        <div className="rounded-xl border border-border-strong bg-surface-3 p-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-lg bg-gradient-to-br from-brand to-[#8a5f00]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {featured?.title ?? "Episodio de ejemplo"}
              </p>
              <p className="truncate text-xs text-subtle">
                {featured?.channel.displayName ?? "Canal"}
              </p>
            </div>
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-full bg-brand text-[#17130a] glow-amber"
              aria-label="Reproducir"
            >
              <Play size={17} fill="currentColor" className="ml-0.5" />
            </button>
            <span className="rounded-full border border-border px-2 py-1 font-mono text-[11px] text-muted">
              1×
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2.5">
            <span className="font-mono text-[11px] tabular text-subtle">18:42</span>
            <div className="flex flex-1 items-center gap-[2px]">
              {Array.from({ length: 56 }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    index / 56 < 0.62 ? "bg-brand" : "bg-border",
                  )}
                />
              ))}
            </div>
            <span className="font-mono text-[11px] tabular text-subtle">48:15</span>
          </div>
        </div>
      </Section>

      <div className="flex items-center justify-between border-t border-border py-8">
        <p className="text-xs text-subtle">
          Todo lo de esta página se construye con datos reales de la base.
        </p>
        <Link
          href="/explorar"
          className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
        >
          Ver en explorar
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

