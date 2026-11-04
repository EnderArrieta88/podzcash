import Link from "next/link";
import { Search, ShieldCheck, Upload } from "lucide-react";
import { MobileNav, type RailUser } from "@/components/shell/side-rail";

export function TopBar({ user }: { user: RailUser }) {
  return (
    <header className="sticky top-0 z-30 glass border-b">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <span className="flex size-7 items-center justify-center rounded-md bg-brand text-[#17130a]">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1.5" y="6" width="2" height="4" rx="1" fill="currentColor" />
              <rect x="7" y="2.5" width="2" height="11" rx="1" fill="currentColor" />
              <rect x="12.5" y="4.5" width="2" height="7" rx="1" fill="currentColor" />
            </svg>
          </span>
          <span className="text-sm font-bold tracking-tight">
            Pod<span className="text-brand">Zcash</span>
          </span>
        </Link>

        <form action="/explorar" className="relative hidden w-full max-w-xl md:block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle"
          />
          <input
            type="search"
            name="q"
            placeholder="Buscar podcasts, música, canales…"
            aria-label="Buscar"
            className="h-10 w-full rounded-xl border border-transparent bg-surface-2 pl-10 pr-16 text-sm text-text placeholder:text-subtle transition-colors outline-none focus:border-brand/50 focus:bg-surface-3"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-subtle xl:block">
            ⌘K
          </kbd>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-jade/25 bg-jade-soft px-3 py-1.5 text-[11px] text-jade-bright md:flex">
            <ShieldCheck size={13} />
            ZEC sin custodia
          </span>

          {user?.channel ? (
            <Link
              href="/estudio/episodios/nuevo"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand px-3.5 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
            >
              <Upload size={15} />
              <span className="hidden sm:inline">Subir</span>
            </Link>
          ) : (
            <Link
              href="/entrar"
              className="inline-flex h-9 items-center rounded-xl border border-border bg-surface-2 px-3.5 text-sm text-text transition-colors hover:bg-surface-3"
            >
              Entrar
            </Link>
          )}

          {user && (
            <Link
              href={user.channel ? `/c/${user.channel.handle}` : "/estudio/canal"}
              className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-3 text-xs font-semibold text-brand"
              aria-label="Mi perfil"
            >
              {user.channel?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.channel.avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                (user.channel?.displayName ?? user.name).slice(0, 1).toUpperCase()
              )}
            </Link>
          )}
        </div>
      </div>

      <MobileNav />
    </header>
  );
}
