import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";

const navigation = [
  { label: "Explorar", href: "/explorar" },
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Para creadores", href: "/#creadores" },
  { label: "Proyecto", href: "/proyecto" },
  { label: "Donaciones", href: "/#donaciones" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-[#17130a]">
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
          <span className="font-heading text-[15px] font-bold tracking-tight">
            Pod<span className="text-brand">Zcash</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted transition-colors hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {user ? (
          <Link
            href="/estudio"
            className="inline-flex h-9 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
          >
            Mi estudio
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-border px-3 py-1 text-xs text-muted sm:inline-block">
              Por invitación
            </span>
            <Link
              href="/entrar"
              className="text-sm text-muted transition-colors hover:text-text"
            >
              Entrar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
