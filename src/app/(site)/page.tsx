import { Mic, Radio, ShieldCheck, Upload, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { DbStatus } from "@/components/db-status";
import { EpisodeCard } from "@/components/content/episode-card";
import { ChannelCard } from "@/components/content/channel-card";
import { SearchField } from "@/components/content/search-field";
import { getChannels, getLatestEpisodes } from "@/lib/catalog";

const waveform = [22, 38, 56, 34, 70, 48, 88, 62, 40, 74, 30, 54, 82, 44, 66, 28];

const reasons = [
  {
    icon: Radio,
    title: "Tu canal, tu casa",
    body: "Un espacio propio con tu perfil, tu catálogo y tus enlaces. Sin depender del algoritmo de otra red social.",
  },
  {
    icon: Wallet,
    title: "Donaciones directas en ZEC",
    body: "La comunidad te apoya con Zcash de persona a persona. El dinero llega a tu wallet, no a la plataforma.",
  },
  {
    icon: ShieldCheck,
    title: "Sin custodia",
    body: "Tú mantienes el control de tus llaves en todo momento. Nosotros nunca tocamos tus fondos.",
  },
];

const steps = [
  {
    icon: Users,
    title: "Creas tu canal",
    body: "Eliges tu handle, subes tu foto y describes de qué hablas o qué música haces.",
  },
  {
    icon: Upload,
    title: "Publicas tu audio",
    body: "Subes podcasts o tracks con portada, descripción y etiquetas. Tu feed RSS sale solo.",
  },
  {
    icon: Mic,
    title: "Recibes apoyo",
    body: "Compartes tu dirección Zcash y quien quiera te apoya con un QR, en segundos.",
  },
];

export default async function Home() {
  const [latestEpisodes, channels] = await Promise.all([
    getLatestEpisodes(8),
    getChannels(6),
  ]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.35]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] glow-brand" />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
              <span className="size-1.5 rounded-full bg-brand" />
              Hecho para el ecosistema Zcash
            </span>

            <h1 className="mt-6 font-display text-5xl font-normal leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              El hogar de los{" "}
              <span className="bg-gradient-to-r from-brand to-brand-strong bg-clip-text text-transparent">
                podcasts y la música
              </span>{" "}
              de Zcash.
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              Publica tu contenido, construye tu audiencia y recibe donaciones
              directas en ZEC. Sin intermediarios, sin custodia y sin pedirle
              permiso a nadie.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href="#como-funciona">Ver cómo funciona</ButtonLink>
              <ButtonLink href="#creadores" variant="secondary">
                Para creadores
              </ButtonLink>
            </div>

            <p className="mt-5 text-xs text-muted">
              Donaciones peer-to-peer · Tu wallet, tus llaves · Contenido en
              español e inglés
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-brand/5 blur-2xl" />
            <div className="relative rounded-2xl border border-border bg-surface p-5 shadow-[0_0_80px_-30px_rgba(244,183,40,0.25)]">
              <div className="flex items-start justify-between">
                <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted">
                  Podcast · Episodio 12
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-medium text-brand">
                  <span className="flex size-3.5 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-[#17130a]">
                    Z
                  </span>
                  Acepta ZEC
                </span>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="size-16 shrink-0 rounded-xl bg-gradient-to-br from-brand via-amber-500 to-orange-700" />
                <div className="min-w-0">
                  <p className="truncate font-display text-xl">
                    Privacidad por defecto
                  </p>
                  <p className="truncate text-xs text-muted">
                    Zcash en Español · hace 2 días
                  </p>
                </div>
              </div>

              <div className="mt-6 flex h-14 items-end gap-1">
                {waveform.map((height, index) => (
                  <span
                    key={index}
                    className={
                      index < 9
                        ? "flex-1 rounded-full bg-brand"
                        : "flex-1 rounded-full bg-border"
                    }
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between font-mono text-[11px] tabular text-subtle">
                <span>18:24</span>
                <span>42:10</span>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center rounded-full bg-brand text-[#17130a]"
                  aria-label="Reproducir (demostración)"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.5 2.8v10.4c0 .6.7 1 1.2.7l8.1-5.2a.8.8 0 0 0 0-1.4L5.7 2.1a.8.8 0 0 0-1.2.7Z" />
                  </svg>
                </button>
                <span className="text-xs text-muted">
                  Interfaz de demostración
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/70">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight">
                Recién publicado
              </h2>
              <p className="mt-2 text-sm text-muted">
                Lo último que subió la comunidad.
              </p>
            </div>

            <div className="w-full max-w-sm">
              <SearchField />
            </div>
          </div>

          {latestEpisodes.length > 0 ? (
            <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
              {latestEpisodes.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>
          ) : (
            <div className="mt-9 rounded-xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
              <p className="font-heading text-2xl font-bold">Todavía no hay episodios</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                PodZcash está empezando. Sé de los primeros en publicar tu
                podcast o tu música.
              </p>
              <ButtonLink href="/registro" className="mt-6">
                Crear mi canal
              </ButtonLink>
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/explorar"
              className="text-sm text-brand underline-offset-4 hover:underline"
            >
              Explorar todo →
            </Link>
          </div>
        </div>
      </section>

      <section id="creadores" className="border-t border-border/70">
        <div className="mx-auto w-full max-w-6xl px-5 py-20">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Lo que hace diferente a PodZcash
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            No es otra red social con un botón de donar. Es una plataforma
            pensada desde el inicio para que el creador cobre directo.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {reasons.map((reason) => (
              <article
                key={reason.title}
                className="rounded-xl border border-border bg-surface p-6 transition-colors hover:border-brand/30"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <reason.icon size={18} strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 text-base font-medium">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {reason.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {channels.length > 0 && (
        <section className="border-t border-border/70">
          <div className="mx-auto w-full max-w-6xl px-5 py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-3xl font-bold tracking-tight">
                  Canales
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Quiénes están publicando hoy.
                </p>
              </div>
              <Link
                href="/explorar"
                className="text-sm text-brand underline-offset-4 hover:underline"
              >
                Ver todos →
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {channels.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="como-funciona" className="border-t border-border/70">
        <div className="mx-auto w-full max-w-6xl px-5 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Cómo funciona
              </h2>
              <p className="mt-3 max-w-xl text-muted">
                Tres pasos, sin fricción y sin formularios de KYC para quien
                dona.
              </p>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              MVP · audio primero
            </span>
          </div>

          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-xl border border-border bg-surface p-6"
              >
                <span className="absolute right-5 top-5 text-xs font-mono text-brand-dim">
                  0{index + 1}
                </span>
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-surface-2 text-brand">
                  <step.icon size={18} strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 text-base font-medium">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="donaciones" className="border-t border-border/70">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Donaciones que no pasan por nosotros
            </h2>
            <p className="mt-4 text-muted">
              Cada creador muestra su propia dirección de Zcash. Quien quiera
              apoyar escanea un QR o abre su wallet con un enlace{" "}
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-text">
                zcash:
              </code>{" "}
              y el pago va directo a su wallet.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted">
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                Nadie necesita cuenta para donar.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                Las transacciones protegidas permiten dejar un mensaje en el memo.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                La plataforma nunca retiene ni mueve tus fondos.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <p className="text-xs uppercase tracking-widest text-muted">
              Estado del proyecto
            </p>
            <div className="mt-4">
              <DbStatus />
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-brand">✓</span>
                <span>
                  Fase 0 — Fundaciones
                  <span className="block text-xs text-muted">
                    Proyecto, base de datos y diseño base
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-brand">✓</span>
                <span>
                  Fase 1 — Cuentas y canales
                  <span className="block text-xs text-muted">
                    Registro por invitación, estudio y página pública
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-brand">✓</span>
                <span>
                  Fase 2 — Subida de audio
                  <span className="block text-xs text-muted">
                    Streaming a disco, portadas, borradores y publicación
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-brand">✓</span>
                <span>
                  Fase 3 — Reproductor persistente
                  <span className="block text-xs text-muted">
                    No se corta al navegar, velocidad y continuar escuchando
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-brand">✓</span>
                <span>
                  Fase 4 — Descubrimiento
                  <span className="block text-xs text-muted">
                    Búsqueda full-text, filtros y exploración
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-brand">✓</span>
                <span>
                  Fase 5 — Donaciones en ZEC
                  <span className="block text-xs text-muted">
                    QR, ZIP-321 y validación de direcciones
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3 text-muted">
                <span className="mt-0.5 text-muted">○</span>
                <span>
                  Fase 6 — RSS y embeds
                  <span className="block text-xs">Siguiente</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

