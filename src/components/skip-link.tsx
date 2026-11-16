export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#contenido"
      className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-[#17130a] transition-transform focus:translate-y-0"
    >
      {label}
    </a>
  );
}
