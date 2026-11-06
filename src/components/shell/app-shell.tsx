import { getCurrentUser } from "@/lib/auth/session";
import { storage } from "@/lib/storage";
import type { RailUser } from "@/components/shell/side-rail";
import { ShellFrame } from "@/components/shell/shell-frame";
import { getLocale } from "@/lib/i18n/locale";
import { shellContent } from "@/lib/i18n/shell";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);

  const railUser: RailUser = user
    ? {
        name: user.name,
        role: user.role,
        channel: user.channel
          ? {
              handle: user.channel.handle,
              displayName: user.channel.displayName,
              avatarUrl: user.channel.avatarKey
                ? storage.url(user.channel.avatarKey)
                : null,
            }
          : null,
      }
    : null;

  return (
    <ShellFrame user={railUser} locale={locale} labels={shellContent[locale]}>
      {children}
    </ShellFrame>
  );
}
