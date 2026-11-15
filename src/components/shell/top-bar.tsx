import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AccountMenu } from "@/components/shell/account-menu";
import { MobileMenu } from "@/components/shell/mobile-menu";
import { SearchBox, SearchShortcut } from "@/components/shell/search-box";
import type { RailUser } from "@/components/shell/side-rail";
import type { Locale } from "@/lib/i18n/config";
import type { ShellContent } from "@/lib/i18n/shell";

export function TopBar({
  user,
  locale,
  labels,
}: {
  user: RailUser;
  locale: Locale;
  labels: ShellContent;
}) {
  return (
    <header className="sticky top-0 z-30 glass border-b">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <MobileMenu user={user} locale={locale} />

        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <span className="flex size-7 items-center justify-center rounded-md bg-brand text-[#17130a]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="1.5"
                y="6"
                width="2"
                height="4"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="7"
                y="2.5"
                width="2"
                height="11"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="12.5"
                y="4.5"
                width="2"
                height="7"
                rx="1"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="text-sm font-bold tracking-tight">
            Pod<span className="text-brand">Zcash</span>
          </span>
        </Link>

        <SearchShortcut />
        <SearchBox
          placeholder={labels.searchPlaceholder}
          label={labels.searchLabel}
        />

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden whitespace-nowrap items-center gap-1.5 rounded-full border border-jade/25 bg-jade-soft px-3 py-1.5 text-[11px] text-jade-bright xl:flex">
            <ShieldCheck size={13} />
            {labels.nonCustodial}
          </span>

          {!user && (
            <Link
              href="/entrar"
              className="inline-flex h-9 items-center whitespace-nowrap rounded-xl border border-border bg-surface-2 px-3.5 text-sm text-text transition-colors hover:bg-surface-3"
            >
              {labels.enter}
            </Link>
          )}

          {user && <AccountMenu user={user} locale={locale} />}
        </div>
      </div>
    </header>
  );
}
