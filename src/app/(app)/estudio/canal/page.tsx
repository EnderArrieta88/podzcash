import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guards";
import { parseLinks } from "@/lib/links";
import { storage } from "@/lib/storage";
import { ChannelForm } from "@/features/channels/components/channel-form";
import { listAddressChanges } from "@/features/channels/queries";
import { formatDate } from "@/lib/format";
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
  const history = channel ? await listAddressChanges(channel.id) : [];

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

      {channel && (
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-heading text-sm font-semibold">
            {content.history.title}
          </h2>
          <p className="mt-1 text-xs text-muted">{content.history.intro}</p>

          {history.length === 0 ? (
            <p className="mt-4 text-sm text-muted">{content.history.empty}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {history.map((change) => (
                <li
                  key={change.id}
                  className="rounded-lg border border-border bg-surface-2/60 p-3 text-xs"
                >
                  <p className="font-mono text-[10px] text-subtle">
                    {formatDate(change.createdAt, locale)}
                    {change.ip ? ` · ${content.history.ip}: ${change.ip}` : ""}
                  </p>
                  <p className="mt-2 text-muted">
                    {content.history.previous}:{" "}
                    <span className="break-all font-mono text-[11px] text-text">
                      {change.previousAddress ?? content.history.none}
                    </span>
                  </p>
                  <p className="mt-1 text-muted">
                    {content.history.next}:{" "}
                    <span className="break-all font-mono text-[11px] text-text">
                      {change.newAddress ?? content.history.none}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
