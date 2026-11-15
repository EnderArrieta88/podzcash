"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

const subscribeToPlatform = () => () => {};

function isApplePlatform() {
  if (typeof navigator === "undefined") return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Atajo global de búsqueda. Vive separado del formulario para seguir activo
 * cuando el buscador superior se oculta en /explorar.
 */
export function SearchShortcut() {
  const isApple = useSyncExternalStore(
    subscribeToPlatform,
    isApplePlatform,
    () => false,
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();

        const candidates = Array.from(
          document.querySelectorAll<HTMLInputElement>(
            "[data-search-primary], [data-global-search]",
          ),
        );
        const target =
          candidates.find(
            (input) =>
              !input.closest("[hidden]") && input.getClientRects().length > 0,
          ) ?? candidates[0];

        target?.focus();
        target?.select();
        return;
      }

      if (event.key === "Escape") {
        const active = document.activeElement;
        if (
          active instanceof HTMLInputElement &&
          (active.hasAttribute("data-search-primary") ||
            active.hasAttribute("data-global-search"))
        ) {
          active.blur();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <span
      hidden
      aria-hidden="true"
      data-search-shortcut={isApple ? "meta" : "ctrl"}
    />
  );
}

export function SearchBox({
  placeholder,
  label,
}: {
  placeholder: string;
  label: string;
}) {
  const pathname = usePathname();
  const isApple = useSyncExternalStore(
    subscribeToPlatform,
    isApplePlatform,
    () => false,
  );

  if (pathname === "/explorar") return null;

  return (
    <form
      action="/explorar"
      className="relative hidden w-full max-w-xl md:block"
    >
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle"
      />
      <input
        type="search"
        name="q"
        placeholder={placeholder}
        aria-label={label}
        aria-keyshortcuts={isApple ? "Meta+K" : "Control+K"}
        data-global-search
        className="h-10 w-full rounded-xl border border-transparent bg-surface-2 pl-10 pr-16 text-sm text-text placeholder:text-subtle transition-colors outline-none focus:border-brand/50 focus:bg-surface-3"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-subtle xl:block">
        {isApple ? "⌘K" : "Ctrl K"}
      </kbd>
    </form>
  );
}
