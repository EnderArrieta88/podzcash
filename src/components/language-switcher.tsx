"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Languages } from "lucide-react";
import { setLocale } from "@/lib/i18n/actions";
import { isLocale, type Locale } from "@/lib/i18n/config";

const options = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
] as const;

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
};

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"down" | "up">("down");
  const [align, setAlign] = useState<"left" | "right">("left");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);

  const current =
    options.find((option) => option.value === locale) ?? options[0];

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (
        container.current &&
        !container.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function toggle() {
    if (!open && container.current) {
      const rect = container.current.getBoundingClientRect();
      setPlacement(window.innerHeight - rect.bottom < 220 ? "up" : "down");
      setAlign(
        rect.left + rect.width / 2 < window.innerWidth / 2 ? "left" : "right",
      );
    }
    setOpen((value) => !value);
  }

  function choose(value: string) {
    if (!isLocale(value)) return;

    setOpen(false);
    if (value === locale) return;

    startTransition(async () => {
      await setLocale(value);
      router.refresh();
    });
  }

  return (
    <div className="relative w-fit self-start" ref={container}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${current.label}`}
        className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-surface px-2.5 text-xs text-muted transition-colors hover:border-border-strong hover:text-text"
      >
        <Languages size={14} className="text-brand" />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown
          size={12}
          className={
            open ? "rotate-180 transition-transform" : "transition-transform"
          }
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className={
            placement === "up"
              ? `absolute bottom-full z-50 mb-2 w-40 overflow-hidden rounded-xl border border-border bg-surface-2 p-1 shadow-xl ${
                  align === "left" ? "left-0" : "right-0"
                }`
              : `absolute top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-surface-2 p-1 shadow-xl ${
                  align === "left" ? "left-0" : "right-0"
                }`
          }
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === locale}
              onClick={() => choose(option.value)}
              disabled={pending}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs text-muted transition-colors hover:bg-surface-3 hover:text-text disabled:opacity-60"
            >
              {option.label}
              {option.value === locale && (
                <Check size={13} className="text-jade" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
