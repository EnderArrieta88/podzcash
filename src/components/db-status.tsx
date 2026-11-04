"use client";

import { useEffect, useState } from "react";

type Health =
  | { state: "loading" }
  | { state: "ok"; channels: number; episodes: number }
  | { state: "error" };

export function DbStatus() {
  const [health, setHealth] = useState<Health>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/health")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        setHealth({
          state: "ok",
          channels: data.channels,
          episodes: data.episodes,
        });
      })
      .catch(() => {
        if (!cancelled) setHealth({ state: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const dot = {
    loading: "bg-muted animate-pulse",
    ok: "bg-emerald-400",
    error: "bg-red-400",
  }[health.state];

  const label = {
    loading: "Comprobando base de datos…",
    ok: "Base de datos conectada",
    error: "No se pudo conectar a la base de datos",
  }[health.state];

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
      <span className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${dot}`} />
        <span className="text-text">{label}</span>
      </span>
      {health.state === "ok" && (
        <span className="text-muted">
          · {health.channels} canales · {health.episodes} episodios
        </span>
      )}
    </div>
  );
}
