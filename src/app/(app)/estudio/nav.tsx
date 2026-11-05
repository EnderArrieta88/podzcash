"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListMusic,
  Radio,
  Ticket,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const baseItems: NavItem[] = [
  { href: "/estudio", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/estudio/episodios", label: "Episodios", icon: ListMusic },
  { href: "/estudio/canal", label: "Mi canal", icon: Radio },
  { href: "/estudio/cuenta", label: "Cuenta", icon: UserRound },
];

export function StudioNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const links: NavItem[] = isAdmin
    ? [
        ...baseItems,
        { href: "/estudio/invitaciones", label: "Invitaciones", icon: Ticket },
      ]
    : baseItems;

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-border">
      {links.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm transition-colors",
              active
                ? "font-semibold text-brand"
                : "text-muted hover:text-text",
            )}
          >
            <item.icon size={15} strokeWidth={1.8} />
            {item.label}
            {active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
