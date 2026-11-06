import { LanguageSwitcher } from "@/components/language-switcher";
import { commonContent } from "@/lib/i18n/common";
import { getLocale } from "@/lib/i18n/locale";

export async function SiteFooter() {
  const locale = await getLocale();
  const content = commonContent[locale];

  return (
    <footer className="border-t border-border" lang={locale}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="font-heading font-semibold text-text">
          Pod<span className="text-brand">Zcash</span>
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <p className="font-mono text-[11px] text-subtle">{content.footer.note}</p>
          <LanguageSwitcher locale={locale} label={content.language} />
        </div>
      </div>
    </footer>
  );
}
