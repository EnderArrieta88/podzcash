import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { storage } from "@/lib/storage";
import {
  EpisodeForm,
  type EpisodeFormValues,
} from "@/components/studio/episode-form";

export const metadata: Metadata = { title: "Editar episodio" };

export default async function EditEpisodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();

  if (!user.channel) redirect("/estudio/canal");

  const { id } = await params;

  const episode = await prisma.episode.findFirst({
    where: { id, channelId: user.channel.id },
    include: { tags: { include: { tag: true } } },
  });

  if (!episode) notFound();

  const values: EpisodeFormValues = {
    id: episode.id,
    title: episode.title,
    description: episode.description,
    kind: episode.kind,
    tags: episode.tags.map(({ tag }) => tag.name).join(", "),
    audio: {
      key: episode.audioPath,
      size: episode.fileSize,
      mimeType: episode.mimeType,
      name: "Audio actual",
      durationSec: episode.durationSec,
    },
    coverKey: episode.coverKey,
    coverUrl: episode.coverKey ? storage.url(episode.coverKey) : null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          Editar episodio
        </h1>
        <p className="mt-2 text-sm text-muted">
          Si cambias el audio o la portada, el archivo anterior se elimina al
          guardar.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <EpisodeForm episode={values} />
      </div>
    </div>
  );
}

