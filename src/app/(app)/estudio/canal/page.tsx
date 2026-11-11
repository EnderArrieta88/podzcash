import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guards";
import { parseLinks } from "@/lib/links";
import { storage } from "@/lib/storage";
import { ChannelForm } from "@/components/studio/channel-form";
import { getLocale } from "@/lib/i18n/locale";
import { channelSettingsContent } from "@/lib/i18n/studio-channel";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return { title: channelSettingsContent[locale].metaTitle };
}

export default async function ChannelSettingsPage() {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const content = channelSettingsContent[locale];
  const channel = user.channel;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          {channel ? content.editTitle : content.createTitle}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {channel ? content.editIntro : content.createIntro}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <ChannelForm
          channel={
            channel
              ? {
                  handle: channel.handle,
                  displayName: channel.displayName,
                  bio: channel.bio,
                  avatarUrl: channel.avatarKey
                    ? storage.url(channel.avatarKey)
                    : null,
                  bannerUrl: channel.bannerKey
                    ? storage.url(channel.bannerKey)
                    : null,
                  zcashAddress: channel.zcashAddress,
                  feedLanguage: channel.feedLanguage,
                  feedCategory: channel.feedCategory,
                  feedExplicit: channel.feedExplicit,
                  ownerEmail: channel.ownerEmail,
                  block: channel.block,
                  newFeedUrl: channel.newFeedUrl,
                }
              : null
          }
          links={parseLinks(channel?.links ?? null)}
          labels={content.form}
        />
      </div>
    </div>
  );
}
