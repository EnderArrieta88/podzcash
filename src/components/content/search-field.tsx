import { Search } from "lucide-react";

export function SearchField({
  defaultValue = "",
  placeholder = "Busca episodios, canales o etiquetas",
  autoFocus = false,
}: {
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <form action="/explorar" className="relative flex items-center">
      <Search
        size={17}
        className="pointer-events-none absolute left-4 text-subtle"
      />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Buscar en PodZcash"
        className="h-12 w-full rounded-full border border-border bg-surface pr-[6.5rem] pl-11 text-sm text-text placeholder:text-subtle transition-colors outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
      />
      <button
        type="submit"
        className="absolute right-1.5 h-9 rounded-full bg-brand px-4 text-sm font-medium text-[#17130a] transition-colors hover:bg-brand-strong"
      >
        Buscar
      </button>
    </form>
  );
}
