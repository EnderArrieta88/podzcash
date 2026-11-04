export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          Pod<span className="text-brand">Zcash</span> — podcasts y música del
          ecosistema Zcash.
        </p>
        <p className="text-xs">
          Proyecto en desarrollo · Donaciones directas en ZEC, sin custodia.
        </p>
      </div>
    </footer>
  );
}
