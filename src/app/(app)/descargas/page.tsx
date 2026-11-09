import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/locale";
import { offlineAudioContent } from "@/lib/i18n/offline-audio";
import { DownloadsList } from "@/components/player/downloads-list";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return { title: offlineAudioContent[locale].pageMeta };
}

export default async function DownloadsPage() {
  const locale = await getLocale();
  const labels = offlineAudioContent[locale];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          {labels.pageTitle}
        </h1>
        <p className="mt-2 text-sm text-muted">{labels.intro}</p>
      </div>

      <DownloadsList labels={labels} locale={locale} />
    </div>
  );
}
