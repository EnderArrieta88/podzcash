import { SiteFooter } from "@/components/site-footer";
import { SkipLink } from "@/components/skip-link";
import { TopBar } from "@/components/shell/top-bar";
import type { RailUser } from "@/components/shell/side-rail";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocale } from "@/lib/i18n/locale";
import { shellContent } from "@/lib/i18n/shell";
import { storage } from "@/lib/storage";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const labels = shellContent[locale];

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
    <div className="min-h-dvh bg-bg">
      <SkipLink label={labels.skipToContent} />
      <TopBar user={railUser} locale={locale} labels={labels} publicMode />
      <main
        id="contenido"
        tabIndex={-1}
        className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6"
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
