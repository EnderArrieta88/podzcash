"use client";

import { useEffect, useState } from "react";
import { SideRail, type RailUser } from "@/components/shell/side-rail";
import { TopBar } from "@/components/shell/top-bar";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { ShellContent } from "@/lib/i18n/shell";

const STORAGE_KEY = "podzcash:rail";

export function ShellFrame({
  user,
  locale,
  labels,
  children,
}: {
  user: RailUser;
  locale: Locale;
  labels: ShellContent;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  // Restaura la preferencia del rail.
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) === "collapsed";

    // En un microtask: leer localStorage al montar es una sincronización con
    // un sistema externo y así no provoca un render en cascada en el efecto.
    queueMicrotask(() => {
      if (saved) setCollapsed(true);
      setReady(true);
    });
  }, []);

  // La barra del reproductor y el contenido se desplazan según el rail.
  useEffect(() => {
    if (!ready) return;

    const root = document.documentElement;
    root.style.setProperty("--rail-width", collapsed ? "80px" : "256px");
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "collapsed" : "expanded");

    return () => {
      root.style.setProperty("--rail-width", "0px");
    };
  }, [collapsed, ready]);

  return (
    <div className="min-h-dvh bg-bg">
      <SideRail
        user={user}
        collapsed={collapsed}
        onToggle={() => setCollapsed((current) => !current)}
        labels={labels}
        locale={locale}
      />

      <div
        className={cn(
          "transition-[padding-left] duration-200",
          collapsed ? "lg:pl-20" : "lg:pl-64",
        )}
      >
        <TopBar user={user} locale={locale} labels={labels} />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
