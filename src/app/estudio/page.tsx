import Link from "next/link";
import { ArrowUpRight, Mic2, Radio } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { parseLinks } from "@/lib/links";
import { storage } from "@/lib/storage";
import { ButtonLink } from "@/components/ui/button-link";

export default async function StudioPage() {
  const user = await requireUser();

  if (!user.channel) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8">
        <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
          Paso 1 de 2
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">
          Crea tu canal
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
          Tu canal es tu casa dentro de PodZcash: la página donde la comunidad
          encuentra tu contenido, tu historia y tu forma de recibir apoyo.
        </p>

        <ul className="mt-6 space-y-2 text-sm text-muted">
          <li className="flex gap-2.5">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
            Eliges un handle único: <code className="text-text">/c/tu-nombre</code>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
            Subes avatar, bio y enlaces
          </li>
          <li className="flex gap-2.5">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
            En la siguiente fase podrás publicar audio
          </li>
        </ul>

        <ButtonLink href="/estudio/canal" className="mt-7">
          Crear mi canal
        </ButtonLink>
      </div>
    );
  }

  const channel = user.channel;
  const episodes = await prisma.episode.count({
    where: { channelId: channel.id },
  });
  const links = parseLinks(channel.links);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start gap-5">
          {channel.avatarKey ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={storage.url(channel.avatarKey)}
              alt=""
              className="size-20 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="flex size-20 items-center justify-center rounded-full bg-brand-soft font-display text-2xl text-brand">
              {channel.displayName.slice(0, 1).toUpperCase()}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl tracking-tight">
              {channel.displayName}
            </h1>
            <p className="mt-1 font-mono text-sm text-subtle">
              /c/{channel.handle}
            </p>
            <p className="mt-3 max-w-xl text-sm text-muted">
              {channel.bio ?? "Todavía no escribiste una bio."}
            </p>

            {links.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {links.map((link) => (
                  <a
                    key={`${link.label}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:border-border-strong hover:text-text"
                  >
                    {link.label}
                    <ArrowUpRight size={12} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <Link
            href={`/c/${channel.handle}`}
            target="_blank"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface-2 px-4 text-sm transition-colors hover:bg-border"
          >
            Ver público
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Episodios
          </p>
          <p className="mt-2 font-display text-3xl">{episodes}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Donaciones
          </p>
          <p className="mt-2 font-display text-3xl">—</p>
          <p className="mt-1 text-xs text-subtle">Disponible en la fase 5</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Estado
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm">
            <span className="size-2 rounded-full bg-success" />
            Canal activo
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand/25 bg-brand-soft/40 p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-xl bg-brand/15 text-brand">
            <Mic2 size={17} />
          </span>
          <div>
            <p className="text-sm font-medium">Siguiente: subir tu primer audio</p>
            <p className="mt-1 text-sm text-muted">
              La publicación de episodios llega en la Fase 2. Tu canal ya está
              listo para recibirlo.
            </p>
          </div>
        </div>
        <Link
          href="/estudio/canal"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm transition-colors hover:bg-surface-2"
        >
          <Radio size={14} />
          Editar canal
        </Link>
      </div>
    </div>
  );
}
