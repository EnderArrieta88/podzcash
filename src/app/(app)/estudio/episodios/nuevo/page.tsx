import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { EpisodeForm } from "@/components/studio/episode-form";
import { getLocale } from "@/lib/i18n/locale";
import { studioEpisodesContent } from "@/lib/i18n/studio-episodes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return { title: studioEpisodesContent[locale].meta.new };
}

export default async function NewEpisodePage() {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const content = studioEpisodesContent[locale];

  if (!user.channel) redirect("/estudio/canal");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          {content.newPage.title}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          {content.newPage.intro}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <EpisodeForm episode={null} labels={content.form} />
      </div>
    </div>
  );
}
