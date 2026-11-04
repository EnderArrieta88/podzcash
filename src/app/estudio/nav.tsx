"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Radio, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/estudio", label: "Resumen", icon: LayoutDashboard },
  { href: "/estudio/canal", label: "Mi canal", icon: Radio },
];

export function StudioNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const links = isAdmin
    ? [
        ...items,
        { href: "/estudio/invitaciones", label: "Invitaciones", icon: Ticket },
      ]
    : items;

  return (
    <nav className="mt-5 space-y-1">
      {links.map((item) => {
        const active =
          item.href === "/estudio"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm transition-colors",
              active
                ? "bg-brand-soft/70 text-brand"
                : "text-muted hover:bg-surface-2 hover:text-text",
            )}
          >
            <item.icon size={16} strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
