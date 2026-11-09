"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Download,
  LayoutDashboard,
  ListMusic,
  LogOut,
  MessageSquare,
  Radio,
  Rss,
  Ticket,
  UserRound,
} from "lucide-react";
import { logoutAction } from "@/app/(app)/estudio/actions";
import type { RailUser } from "@/components/shell/side-rail";
import type { Locale } from "@/lib/i18n/config";
import { shellContent } from "@/lib/i18n/shell";
import { studioShellContent } from "@/lib/i18n/studio-shell";

export function AccountMenu({
  user,
  locale,
}: {
  user: NonNullable<RailUser>;
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const labels = shellContent[locale];
  const studio = studioShellContent[locale];

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (container.current && !container.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const displayName = user.channel?.displayName ?? user.name;

  const studioItems = [
    { href: "/estudio", label: studio.nav.overview, icon: LayoutDashboard },
    { href: "/estudio/episodios", label: studio.nav.episodes, icon: ListMusic },
    {
      href: "/estudio/comentarios",
      label: studio.nav.comments,
      icon: MessageSquare,
    },
    { href: "/estudio/canal", label: studio.nav.channel, icon: Radio },
    { href: "/estudio/distribucion", label: studio.nav.distribution, icon: Rss },
    ...(user.role === "admin"
      ? [
          {
            href: "/estudio/invitaciones",
            label: studio.nav.invites,
            icon: Ticket,
          },
        ]
      : []),
  ];

  return (
    <div className="relative" ref={container}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={labels.accountMenu}
        className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-3 text-xs font-semibold text-brand transition-colors hover:border-border-strong"
      >
        {user.channel?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.channel.avatarUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          displayName.slice(0, 1).toUpperCase()
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={labels.accountMenu}
          onClick={() => setOpen(false)}
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-surface-2 p-1 shadow-xl"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-text">
              {displayName}
            </p>
            <p className="truncate font-mono text-[11px] text-subtle">
              {user.channel ? `@${user.channel.handle}` : labels.noChannel}
            </p>
          </div>

          {user.channel && (
            <div className="border-b border-border py-1 lg:hidden">
              {studioItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-3 hover:text-text"
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          <div className="py-1">
            <Link
              href="/estudio/cuenta"
              role="menuitem"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-3 hover:text-text"
            >
              <UserRound size={15} />
              {labels.myAccount}
            </Link>
            <Link
              href="/descargas"
              role="menuitem"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-3 hover:text-text"
            >
              <Download size={15} />
              {labels.nav.downloads}
            </Link>
          </div>

          <div className="border-t border-border pt-1">
            <form
              action={logoutAction}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-surface-3 hover:text-danger"
              >
                <LogOut size={15} />
                {labels.logout}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
