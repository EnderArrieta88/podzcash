import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmbedPlayer } from "@/components/embed/embed-player";
import { getLocale } from "@/lib/i18n/locale";
import { embedContent } from "@/lib/i18n/embed";
import { episodePath } from "@/lib/routes";
import { getEmbedEpisode, getEpisodeTitle } from "@/features/episodes/queries";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const content = embedContent[locale];
  const episode = await getEpisodeTitle(id);
  return {
    title: episode ?? content.episodeFallback,
    robots: { index: false, follow: false },
  };
}

export default async function EmbedPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();

  const data = await getEmbedEpisode(id);

  if (!data || data.episode.status !== "published") notFound();

  const { episode, cover, audioUrl } = data;

  const origin = (process.env.SITE_URL ?? "https://podzcash.online").replace(
    /\/+$/,
    "",
  );

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg p-2">
      <EmbedPlayer
        track={{
          id: episode.id,
          title: episode.title,
          channelName: episode.channel.displayName,
          channelHandle: episode.channel.handle,
          coverUrl: cover,
          src: audioUrl,
          durationSec: episode.durationSec,
        }}
        coverUrl={cover}
        href={`${origin}${episodePath(episode.channel.handle, episode.slug)}`}
        locale={locale}
      />
    </div>
  );
}
