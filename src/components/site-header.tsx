import Link from "next/link";

const navigation = [
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Para creadores", href: "#creadores" },
  { label: "Donaciones", href: "#donaciones" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="group flex items-center gap-2.5">
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
          <span className="text-[15px] font-semibold tracking-tight">
            Pod<span className="text-brand">Zcash</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted transition-colors hover:text-text"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
          En desarrollo
        </span>
      </div>
    </header>
  );
}
