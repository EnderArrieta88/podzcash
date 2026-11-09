"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Download,
  LayoutDashboard,
  ListMusic,
  LogIn,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { ShellContent } from "@/lib/i18n/shell";
import { channelPath, donatePath } from "@/lib/routes";
import { activeHref } from "@/lib/nav";
import { LanguageSwitcher } from "@/components/language-switcher";

export type RailUser = {
  name: string;
  role: string;
  channel: {
    handle: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
} | null;

export function SideRail({
  user,
  collapsed,
  onToggle,
  labels,
  locale,
}: {
  user: RailUser;
  collapsed: boolean;
  onToggle: () => void;
  labels: ShellContent;
  locale: Locale;
}) {
  const pathname = usePathname();

  const items = [
    { href: "/", label: labels.nav.home, icon: LayoutDashboard, exact: true },
    { href: "/explorar", label: labels.nav.explore, icon: Compass, exact: false },
    {
      href: "/descargas",
      label: labels.nav.downloads,
      icon: Download,
      exact: true,
    },
    { href: "/estudio", label: labels.nav.studio, icon: ListMusic, exact: false },
    ...(user?.channel
      ? [
          {
            href: channelPath(user.channel.handle),
            label: labels.nav.myChannel,
            icon: Radio,
            exact: false,
          },
        ]
      : []),
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

  const activeItem = activeHref(pathname, items);

  return (
    <aside
      data-rail
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-dvh flex-col border-r border-border bg-surface transition-[width] duration-200 lg:flex",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-[#17130a]">
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
          {!collapsed && (
            <span className="text-[15px] font-bold tracking-tight">
              Pod<span className="text-brand">Zcash</span>
            </span>
          )}
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex size-8 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-text"
            aria-label={labels.collapse}
            title={labels.collapse}
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          className="mx-auto mb-2 inline-flex size-8 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-text"
          aria-label={labels.expand}
          title={labels.expand}
        >
          <PanelLeftOpen size={16} />
        </button>
      )}

      <nav className={cn("mt-2 flex flex-col gap-1", collapsed ? "px-2" : "px-3")}>
        {items.map((item) => {
          const active = item.href === activeItem;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm transition-colors",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-surface-3 font-semibold text-brand"
                  : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              <item.icon size={17} strokeWidth={1.8} className="shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mx-3 mt-6 rounded-xl border border-border bg-surface-2 p-3.5">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-subtle">
            <ShieldCheck size={12} className="text-jade" />
            {labels.donations}
          </p>
          <p className="mt-2 text-sm font-semibold text-text">
            {labels.donationTitle}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {labels.donationBody}
          </p>

          {user?.channel && (
            <Link
              href={donatePath(user.channel.handle)}
              className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-full border border-jade/30 bg-jade-soft text-xs font-medium text-jade-bright transition-colors hover:border-jade/60"
            >
              {labels.supportPage}
            </Link>
          )}
        </div>
      )}

      <div
        className={cn(
          "mt-auto border-t border-border p-3",
          collapsed && "flex flex-col items-center gap-2",
        )}
      >
        {user ? (
          <Link
            href="/estudio/canal"
            title={user.channel?.displayName ?? user.name}
            className={cn(
              "rounded-lg transition-colors hover:bg-surface-2",
              collapsed
                ? "flex size-10 items-center justify-center"
                : "flex items-center gap-2.5 p-2",
            )}
          >
            {user.channel?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.channel.avatarUrl}
                alt=""
                className="size-8 rounded-full border border-border object-cover"
              />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                {(user.channel?.displayName ?? user.name).slice(0, 1).toUpperCase()}
              </span>
            )}

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {user.channel?.displayName ?? user.name}
                </p>
                <p className="truncate font-mono text-[11px] text-subtle">
                  {user.channel ? `@${user.channel.handle}` : labels.noChannel}
                </p>
              </div>
            )}
          </Link>
        ) : (
          <Link
            href="/entrar"
            title={labels.enter}
            className={cn(
              "flex items-center justify-center rounded-full bg-brand text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong",
              collapsed ? "size-10" : "h-10 w-full px-4",
            )}
          >
            {collapsed ? <LogIn size={16} /> : labels.enter}
          </Link>
        )}

        {!collapsed && (
          <div className="mt-1">
            <LanguageSwitcher locale={locale} label={labels.language} />
          </div>
        )}
      </div>
    </aside>
  );
}
