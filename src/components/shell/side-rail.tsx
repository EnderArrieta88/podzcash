"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  ListMusic,
  LogOut,
  Radio,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { logoutAction } from "@/app/(app)/estudio/actions";
import { cn } from "@/lib/utils";

export type RailUser = {
  name: string;
  role: string;
  channel: {
    handle: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
} | null;

const nav = [
  { href: "/", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/explorar", label: "Explorar", icon: Compass },
  { href: "/estudio", label: "Mi estudio", icon: ListMusic },
];

export function SideRail({ user }: { user: RailUser }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-dvh w-64 flex-col border-r border-border bg-surface lg:flex">
      <Link href="/" className="flex h-16 items-center gap-2.5 px-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-[#17130a]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1.5" y="6" width="2" height="4" rx="1" fill="currentColor" />
            <rect x="7" y="2.5" width="2" height="11" rx="1" fill="currentColor" />
            <rect x="12.5" y="4.5" width="2" height="7" rx="1" fill="currentColor" />
          </svg>
        </span>
        <span className="text-[15px] font-bold tracking-tight">
          Pod<span className="text-brand">Zcash</span>
        </span>
      </Link>

      <nav className="mt-2 flex flex-col gap-1 px-3">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-surface-3 font-semibold text-brand"
                  : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              <item.icon size={17} strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}

        {user?.channel && (
          <Link
            href={`/c/${user.channel.handle}`}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              pathname.startsWith(`/c/${user.channel.handle}`)
                ? "bg-surface-3 font-semibold text-brand"
                : "text-muted hover:bg-surface-2 hover:text-text",
            )}
          >
            <Radio size={17} strokeWidth={1.8} />
            Mi canal
          </Link>
        )}
      </nav>

      <div className="mx-3 mt-6 rounded-xl border border-border bg-surface-2 p-3.5">
        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-subtle">
          <ShieldCheck size={12} className="text-jade" />
          Donaciones
        </p>
        <p className="mt-2 text-sm font-semibold text-text">
          Directo a tu wallet
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          ZEC de persona a persona. PodZcash nunca retiene tus fondos.
        </p>

        {user?.channel && (
          <Link
            href={`/c/${user.channel.handle}/donar`}
            className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-full border border-jade/30 bg-jade-soft text-xs font-medium text-jade-bright transition-colors hover:border-jade/60"
          >
            Ver página de apoyo
          </Link>
        )}
      </div>

      <div className="mt-auto border-t border-border p-3">
        {user ? (
          <>
            <Link
              href="/estudio/canal"
              className="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-surface-2"
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
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {user.channel?.displayName ?? user.name}
                </p>
                <p className="truncate font-mono text-[11px] text-subtle">
                  {user.channel ? `@${user.channel.handle}` : "Sin canal"}
                </p>
              </div>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-subtle transition-colors hover:bg-surface-2 hover:text-text"
              >
                <LogOut size={14} />
                Cerrar sesión
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/entrar"
            className="flex h-10 items-center justify-center rounded-full bg-brand px-4 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
          >
            Entrar
          </Link>
        )}
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Inicio", icon: LayoutDashboard, exact: true },
    { href: "/explorar", label: "Explorar", icon: Compass },
    { href: "/estudio", label: "Estudio", icon: Upload },
  ];

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-3 py-2 lg:hidden">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors",
              active
                ? "bg-surface-3 font-semibold text-brand"
                : "text-muted hover:text-text",
            )}
          >
            <item.icon size={14} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
