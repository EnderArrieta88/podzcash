"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListMusic,
  MessageSquare,
  Radio,
  Rss,
  Ticket,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { activeHref } from "@/lib/nav";
import type { StudioShellContent } from "@/lib/i18n/studio-shell";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: number;
};

export function StudioNav({
  isAdmin,
  unreadComments,
  labels,
}: {
  isAdmin: boolean;
  unreadComments: number;
  labels: StudioShellContent["nav"];
}) {
  const pathname = usePathname();

  const baseItems: NavItem[] = [
    {
      href: "/estudio",
      label: labels.overview,
      icon: LayoutDashboard,
      exact: true,
    },
    { href: "/estudio/episodios", label: labels.episodes, icon: ListMusic },
    {
      href: "/estudio/comentarios",
      label: labels.comments,
      icon: MessageSquare,
      badge: unreadComments,
    },
    { href: "/estudio/canal", label: labels.channel, icon: Radio },
    { href: "/estudio/distribucion", label: labels.distribution, icon: Rss },
    { href: "/estudio/cuenta", label: labels.account, icon: UserRound },
  ];

  const links: NavItem[] = isAdmin
    ? [
        ...baseItems,
        { href: "/estudio/invitaciones", label: labels.invites, icon: Ticket },
      ]
    : baseItems;

  const activeItem = activeHref(pathname, links);

  return (
    <nav className="hidden items-center gap-1 overflow-x-auto border-b border-border lg:flex">
      {links.map((item) => {
        const active = item.href === activeItem;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm transition-colors",
              active
                ? "font-semibold text-brand"
                : "text-muted hover:text-text",
            )}
          >
            <item.icon size={15} strokeWidth={1.8} />
            {item.label}
            {item.badge ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 py-px font-mono text-[10px] font-semibold text-[#17130a]">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : null}
            {active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
