import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flag } from "lucide-react";
import { prisma } from "@/lib/db";
import { Input, Label, Textarea } from "@/components/ui/field";
import { submitReportAction } from "../actions";

export const metadata: Metadata = {
  title: "Reportar contenido",
  robots: { index: false, follow: false },
};

const reasons = [
  { value: "spam", label: "Spam o contenido engañoso" },
  { value: "acoso", label: "Acoso o discurso de odio" },
  { value: "copyright", label: "Infracción de derechos de autor" },
  { value: "explicito", label: "Contenido explícito sin aviso" },
  { value: "otro", label: "Otro motivo" },
];

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const episode = await prisma.episode.findUnique({
    where: { id },
    include: { channel: { select: { handle: true, displayName: true } } },
  });

  if (!episode || episode.status !== "published") notFound();

  return (
    <div className="mx-auto w-full max-w-xl">
      <Link
        href={`/c/${episode.channel.handle}/${episode.slug}`}
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={15} />
        Volver al episodio
      </Link>

      <div className="mt-5 flex items-center gap-2">
        <Flag size={16} className="text-brand" />
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Reportar contenido
        </h1>
      </div>

      <p className="mt-2 text-sm text-muted">
        Episodio: <span className="text-text">{episode.title}</span> ·{" "}
        {episode.channel.displayName}
      </p>

      {query.ok === "1" ? (
        <div className="mt-6 rounded-xl border border-jade/30 bg-jade-soft px-4 py-3 text-sm text-jade-bright">
          Gracias. Recibimos el reporte y lo vamos a revisar.
        </div>
      ) : (
        <form
          action={submitReportAction}
          className="mt-6 space-y-5 rounded-xl border border-border bg-surface p-6"
        >
          <input type="hidden" name="targetType" value="episode" />
          <input type="hidden" name="targetId" value={episode.id} />

          {query.error && (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
              {query.error === "limit"
                ? "Demasiados reportes desde tu conexión. Probá más tarde."
                : "Revisá los datos e intentá de nuevo."}
            </p>
          )}

          <div>
            <Label htmlFor="reason">Motivo</Label>
            <select
              id="reason"
              name="reason"
              required
              defaultValue=""
              className="h-11 w-full rounded-[10px] border border-border bg-surface-2 px-3 text-sm text-text outline-none focus:border-brand"
            >
              <option value="" disabled>
                Elegí un motivo
              </option>
              {reasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="details">Detalles</Label>
            <Textarea
              id="details"
              name="details"
              rows={4}
              maxLength={1000}
              placeholder="Contanos qué está mal en este contenido."
            />
          </div>

          <div>
            <Label htmlFor="email">
              Tu email{" "}
              <span className="font-normal text-subtle">(opcional)</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              maxLength={200}
              placeholder="Para responderte si hace falta"
            />
          </div>

          <div className="border-t border-border pt-4">
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-medium text-[#17130a] transition-colors hover:bg-brand-strong"
            >
              Enviar reporte
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
