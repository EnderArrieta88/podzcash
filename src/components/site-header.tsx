import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getCurrentUser } from "@/lib/auth/session";
import { commonContent } from "@/lib/i18n/common";
import { getLocale } from "@/lib/i18n/locale";

export async function SiteHeader() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const content = commonContent[locale];

  const navigation = [
    { label: content.nav.explore, href: "/explorar" },
    { label: content.nav.how, href: "/#como-funciona" },
    { label: content.nav.creators, href: "/#creadores" },
    { label: content.nav.project, href: "/proyecto" },
    { label: content.nav.donations, href: "/#donaciones" },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b" lang={locale}>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-[#17130a]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <rect x="1.5" y="6" width="2" height="4" rx="1" fill="currentColor" />
              <rect x="7" y="2.5" width="2" height="11" rx="1" fill="currentColor" />
              <rect x="12.5" y="4.5" width="2" height="7" rx="1" fill="currentColor" />
            </svg>
          </span>
          <span className="font-heading text-[15px] font-bold tracking-tight">
            Pod<span className="text-brand">Zcash</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted transition-colors hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} label={content.language} />

          {user ? (
            <Link
              href="/estudio"
              className="inline-flex h-9 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
            >
              {content.studio}
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full border border-border px-3 py-1 text-xs text-muted sm:inline-block">
                {content.inviteOnly}
              </span>
              <Link
                href="/entrar"
                className="text-sm text-muted transition-colors hover:text-text"
              >
                {content.enter}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
