"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Download,
  LayoutDashboard,
  ListMusic,
  LogIn,
  Menu,
  ShieldAlert,
  X,
} from "lucide-react";
import type { RailUser } from "@/components/shell/side-rail";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { shellContent } from "@/lib/i18n/shell";
import { activeHref } from "@/lib/nav";

export function MobileMenu({
  user,
  locale,
}: {
  user: RailUser;
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const labels = shellContent[locale];

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const mainItems = [
    { href: "/", label: labels.nav.home, icon: LayoutDashboard, exact: true },
    {
      href: "/explorar",
      label: labels.nav.explore,
      icon: Compass,
      exact: false,
    },
    {
      href: "/descargas",
      label: labels.nav.downloads,
      icon: Download,
      exact: true,
    },
    {
      href: "/estudio",
      label: labels.nav.studio,
      icon: ListMusic,
      exact: false,
    },
    ...(user?.role === "admin"
      ? [
          {
            href: "/estudio/admin",
            label: labels.nav.admin,
            icon: ShieldAlert,
            exact: false,
          },
        ]
      : []),
  ];

  const activeItem = activeHref(pathname, mainItems);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={labels.menu}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text lg:hidden"
      >
        <Menu size={18} />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={labels.menu}
          >
            <button
              type="button"
              aria-label={labels.closeMenu}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/60"
            />

            <aside
              id="mobile-menu"
              className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col border-r border-border bg-bg shadow-2xl"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-[#17130a]">
                    <svg
                      width="16"
                      height="16"
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
                  <span className="text-[15px] font-bold tracking-tight">
                    Pod<span className="text-brand">Zcash</span>
                  </span>
                </Link>

                <button
                  type="button"
                  autoFocus
                  onClick={() => setOpen(false)}
                  aria-label={labels.closeMenu}
                  className="inline-flex size-9 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-text"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4">
                {user && (
                  <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                    {user.channel?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.channel.avatarUrl}
                        alt=""
                        className="size-10 shrink-0 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                        {(user.channel?.displayName ?? user.name)
                          .slice(0, 1)
                          .toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {user.channel?.displayName ?? user.name}
                      </p>
                      <p className="truncate font-mono text-[11px] text-subtle">
                        {user.channel
                          ? `@${user.channel.handle}`
                          : labels.noChannel}
                      </p>
                    </div>
                  </div>
                )}

                <nav className="flex flex-col gap-1">
                  {mainItems.map((item) => {
                    const active = item.href === activeItem;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                          active
                            ? "bg-surface-3 font-semibold text-brand"
                            : "text-muted hover:bg-surface-2 hover:text-text",
                        )}
                      >
                        <item.icon
                          size={17}
                          strokeWidth={1.8}
                          className="shrink-0"
                        />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="shrink-0 border-t border-border p-3">
                <div className={user ? "" : "mb-3"}>
                  <LanguageSwitcher locale={locale} label={labels.language} />
                </div>

                {!user && (
                  <Link
                    href="/entrar"
                    onClick={() => setOpen(false)}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
                  >
                    <LogIn size={16} />
                    {labels.enter}
                  </Link>
                )}
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
