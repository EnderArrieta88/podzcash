import { SiteFooter } from "@/components/site-footer";
import { SkipLink } from "@/components/skip-link";
import { AppShell } from "@/components/shell/app-shell";
import { TopBar } from "@/components/shell/top-bar";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocale } from "@/lib/i18n/locale";
import { shellContent } from "@/lib/i18n/shell";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);

  if (user) {
    return <AppShell>{children}</AppShell>;
  }

  const labels = shellContent[locale];

  return (
    <div className="min-h-dvh bg-bg">
      <SkipLink label={labels.skipToContent} />
      <TopBar user={null} locale={locale} labels={labels} publicMode />
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
