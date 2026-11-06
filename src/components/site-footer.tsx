import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { commonContent } from "@/lib/i18n/common";
import { getLocale } from "@/lib/i18n/locale";

export async function SiteFooter() {
  const locale = await getLocale();
  const content = commonContent[locale];

  return (
    <footer className="border-t border-border" lang={locale}>
      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-heading font-semibold text-text">
              Pod<span className="text-brand">Zcash</span>
            </p>
            <p className="mt-2 max-w-sm font-mono text-[11px] leading-relaxed text-subtle">
              {content.footer.note}
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
            <Link href="/acerca" className="transition-colors hover:text-text">
              {content.footer.about}
            </Link>
            <Link href="/proyecto" className="transition-colors hover:text-text">
              {content.nav.project}
            </Link>
            <Link href="/privacidad" className="transition-colors hover:text-text">
              {content.footer.privacy}
            </Link>
            <Link href="/terminos" className="transition-colors hover:text-text">
              {content.footer.terms}
            </Link>
          </nav>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-[11px] leading-relaxed text-subtle">
            {content.footer.disclaimer}
          </p>
          <LanguageSwitcher locale={locale} label={content.language} />
        </div>
      </div>
    </footer>
  );
}
