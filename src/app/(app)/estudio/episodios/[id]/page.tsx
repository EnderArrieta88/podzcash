import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { storage } from "@/lib/storage";
import {
  EpisodeForm,
  type EpisodeFormValues,
} from "@/components/studio/episode-form";
import { getLocale } from "@/lib/i18n/locale";
import { studioEpisodesContent } from "@/lib/i18n/studio-episodes";
import { episodeEmbedCode } from "@/lib/embed";
import { EmbedCode } from "@/components/embed/embed-code";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return { title: studioEpisodesContent[locale].meta.edit };
}

export default async function EditEpisodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const content = studioEpisodesContent[locale];

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
      name: content.editPage.currentAudio,
      durationSec: episode.durationSec,
    },
    coverKey: episode.coverKey,
    coverUrl: episode.coverKey ? storage.url(episode.coverKey) : null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          {content.editPage.title}
        </h1>
        <p className="mt-2 text-sm text-muted">{content.editPage.intro}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <EpisodeForm episode={values} labels={content.form} />
      </div>

      {episode.status === "published" && (
        <EmbedCode
          code={episodeEmbedCode({
            origin: SITE_URL,
            id: episode.id,
            title: episode.title,
          })}
          labels={{
            title: content.editPage.embedTitle,
            hint: content.editPage.embedHint,
            copy: content.editPage.copy,
            copied: content.editPage.copied,
          }}
          defaultOpen
        />
      )}
    </div>
  );
}

