import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Flag, HardDrive, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { findOrphans } from "@/lib/media-cleanup";
import { formatBytes, formatDate } from "@/lib/format";
import {
  cleanOrphansAction,
  resolveReportAction,
  setEpisodeStatusAction,
  setUserStatusAction,
} from "./actions";

export const metadata: Metadata = { title: "Administración" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ cleaned?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;

  const [users, episodes, reports, channels, orphans, publishedCount] =
    await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          channel: { select: { handle: true, displayName: true } },
        },
      }),
      prisma.episode.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          channel: { select: { handle: true, displayName: true } },
        },
      }),
      prisma.report.findMany({
        where: { status: "open" },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.channel.count(),
      findOrphans(),
      prisma.episode.count({ where: { status: "published" } }),
    ]);

  const episodeIds = reports
    .filter((report) => report.targetType === "episode")
    .map((report) => report.targetId);

  const reportedEpisodes = new Map(
    (
      await prisma.episode.findMany({
        where: { id: { in: episodeIds } },
        select: { id: true, title: true, slug: true, channel: { select: { handle: true } } },
      })
    ).map((episode) => [episode.id, episode]),
  );

  const stats = [
    { label: "Usuarios", value: users.length },
    { label: "Canales", value: channels },
    { label: "Episodios publicados", value: publishedCount },
    { label: "Reportes abiertos", value: reports.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Administración
        </h1>
        <p className="mt-2 text-sm text-muted">
          Moderación, cuentas y limpieza de archivos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
              {stat.label}
            </p>
            <p className="mt-1 font-heading text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Flag size={15} className="text-brand" />
          <h2 className="font-heading text-sm font-semibold">
            Reportes abiertos
          </h2>
        </div>

        {reports.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">
            No hay reportes pendientes.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {reports.map((report) => {
              const episode =
                report.targetType === "episode"
                  ? reportedEpisodes.get(report.targetId)
                  : undefined;

              return (
                <li key={report.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {episode ? episode.title : "Contenido no disponible"}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-subtle">
                        {report.reason} · {formatDate(report.createdAt)}
                      </p>
                      {report.details && (
                        <p className="mt-2 max-w-xl text-sm text-muted">
                          {report.details}
                        </p>
                      )}
                      {episode && (
                        <Link
                          href={`/c/${episode.channel.handle}/${episode.slug}`}
                          className="mt-1 inline-block text-xs text-brand hover:underline"
                        >
                          Ver episodio
                        </Link>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {episode && (
                        <form action={resolveReportAction}>
                          <input type="hidden" name="id" value={report.id} />
                          <input type="hidden" name="decision" value="hide" />
                          <button
                            type="submit"
                            className="inline-flex h-8 items-center rounded-lg border border-danger/40 bg-danger/10 px-3 text-xs text-danger transition-colors hover:bg-danger/20"
                          >
                            Ocultar episodio
                          </button>
                        </form>
                      )}
                      <form action={resolveReportAction}>
                        <input type="hidden" name="id" value={report.id} />
                        <input type="hidden" name="decision" value="dismiss" />
                        <button
                          type="submit"
                          className="inline-flex h-8 items-center rounded-lg border border-border bg-surface-2 px-3 text-xs text-muted transition-colors hover:text-text"
                        >
                          Descartar
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <HardDrive size={16} className="mt-0.5 text-muted" />
            <div>
              <h2 className="font-heading text-sm font-semibold">
                Medios huérfanos
              </h2>
              <p className="mt-1 text-xs text-muted">
                {orphans.files.length === 0
                  ? "No hay archivos sin usar."
                  : `${orphans.files.length} archivo(s) sin referencia · ${formatBytes(orphans.bytes)}`}
              </p>
            </div>
          </div>

          {orphans.files.length > 0 && (
            <form action={cleanOrphansAction}>
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-xl border border-danger/40 bg-danger/10 px-4 text-sm text-danger transition-colors hover:bg-danger/20"
              >
                Eliminar huérfanos
              </button>
            </form>
          )}
        </div>

        {query.cleaned && (
          <p className="mt-3 text-xs text-jade-bright">
            Se eliminaron {query.cleaned} archivo(s).
          </p>
        )}
      </section>

      <section className="rounded-xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <ShieldAlert size={15} className="text-muted" />
          <h2 className="font-heading text-sm font-semibold">Usuarios</h2>
        </div>

        <ul className="divide-y divide-border">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {user.name}{" "}
                  <span className="font-mono text-[11px] text-subtle">
                    {user.email}
                  </span>
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-subtle">
                  {user.role} · {user.status} ·{" "}
                  {user.channel ? `@${user.channel.handle}` : "sin canal"}
                </p>
              </div>

              <form action={setUserStatusAction} className="shrink-0">
                <input type="hidden" name="id" value={user.id} />
                <input
                  type="hidden"
                  name="status"
                  value={user.status === "active" ? "suspended" : "active"}
                />
                <button
                  type="submit"
                  className={
                    user.status === "active"
                      ? "inline-flex h-8 items-center rounded-lg border border-border bg-surface-2 px-3 text-xs text-muted transition-colors hover:border-danger/40 hover:text-danger"
                      : "inline-flex h-8 items-center rounded-lg border border-jade/30 bg-jade-soft px-3 text-xs text-jade-bright"
                  }
                >
                  {user.status === "active" ? "Suspender" : "Reactivar"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <AlertTriangle size={15} className="text-muted" />
          <h2 className="font-heading text-sm font-semibold">
            Episodios recientes
          </h2>
        </div>

        <ul className="divide-y divide-border">
          {episodes.map((episode) => (
            <li
              key={episode.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{episode.title}</p>
                <p className="mt-0.5 font-mono text-[11px] text-subtle">
                  @{episode.channel.handle} · {episode.status}
                </p>
              </div>

              <form action={setEpisodeStatusAction} className="shrink-0">
                <input type="hidden" name="id" value={episode.id} />
                <input
                  type="hidden"
                  name="status"
                  value={episode.status === "published" ? "hidden" : "published"}
                />
                <button
                  type="submit"
                  className="inline-flex h-8 items-center rounded-lg border border-border bg-surface-2 px-3 text-xs text-muted transition-colors hover:text-text"
                >
                  {episode.status === "published" ? "Ocultar" : "Publicar"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
