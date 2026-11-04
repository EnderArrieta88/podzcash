export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="font-heading font-semibold text-text">
          Pod<span className="text-brand">Zcash</span>
        </p>
        <p className="font-mono text-[11px] text-subtle">
          Proyecto en desarrollo · Donaciones directas en ZEC, sin custodia.
        </p>
      </div>
    </footer>
  );
}
