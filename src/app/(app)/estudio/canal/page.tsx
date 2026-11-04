import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guards";
import { parseLinks } from "@/lib/links";
import { storage } from "@/lib/storage";
import { ChannelForm } from "@/components/studio/channel-form";

export const metadata: Metadata = { title: "Mi canal" };

export default async function ChannelSettingsPage() {
  const user = await requireUser();
  const channel = user.channel;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          {channel ? "Mi canal" : "Crear mi canal"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {channel
            ? "Así te ve la comunidad. Los cambios se guardan al instante."
            : "Elige tu handle y cuéntale a la comunidad quién eres."}
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
                  zcashAddress: channel.zcashAddress,
                }
              : null
          }
          links={parseLinks(channel?.links ?? null)}
        />
      </div>
    </div>
  );
}

