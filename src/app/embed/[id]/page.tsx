import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { storage } from "@/lib/storage";
import { EmbedPlayer } from "@/components/embed/embed-player";
import { getLocale } from "@/lib/i18n/locale";
import { embedContent } from "@/lib/i18n/embed";
import { episodePath } from "@/lib/routes";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const content = embedContent[locale];
  const episode = await prisma.episode.findUnique({
    where: { id },
    select: { title: true },
  });

  return {
    title: episode?.title ?? content.episodeFallback,
    robots: { index: false, follow: false },
  };
}

export default async function EmbedPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();

  const episode = await prisma.episode.findUnique({
    where: { id },
    include: {
      channel: { select: { handle: true, displayName: true } },
    },
  });

  if (!episode || episode.status !== "published") notFound();

  const origin = (process.env.SITE_URL ?? "https://podzcash.online").replace(
    /\/+$/,
    "",
  );

  const cover = episode.coverKey ? storage.url(episode.coverKey) : null;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg p-2">
      <EmbedPlayer
        track={{
          id: episode.id,
          title: episode.title,
          channelName: episode.channel.displayName,
          channelHandle: episode.channel.handle,
          coverUrl: cover,
          src: storage.url(episode.audioPath),
          durationSec: episode.durationSec,
        }}
        coverUrl={cover}
        href={`${origin}${episodePath(episode.channel.handle, episode.slug)}`}
        locale={locale}
      />
    </div>
  );
}
