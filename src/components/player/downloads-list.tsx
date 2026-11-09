"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Music2, Pause, Play, Trash2 } from "lucide-react";
import { formatBytes, formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { OfflineAudioContent } from "@/lib/i18n/offline-audio";
import {
  clearDownloads,
  DOWNLOADS_EVENT,
  listDownloads,
  OFFLINE_AUDIO_QUOTA_BYTES,
  removeDownload,
  totalSize,
  type OfflineDownload,
} from "@/lib/offline-audio";

/**
 * Lista de descargas con reproducción local, borrado y espacio usado.
 * Se usa en `/descargas` y en la pantalla offline: todo sale de Cache Storage
 * y localStorage, así que funciona sin red.
 */
export function DownloadsList({
  labels,
  locale,
  variant = "page",
}: {
  labels: OfflineAudioContent;
  locale: Locale;
  variant?: "page" | "offline";
}) {
  const [items, setItems] = useState<OfflineDownload[] | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const reload = useCallback(async () => {
    try {
      setItems(await listDownloads());
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    let active = true;

    // Carga inicial: el setState va en el callback async, no en el cuerpo.
    listDownloads()
      .then((items) => {
        if (active) setItems(items);
      })
      .catch(() => {
        if (active) setItems([]);
      });

    const onChange = () => void reload();

    window.addEventListener(DOWNLOADS_EVENT, onChange);
    window.addEventListener("storage", onChange);

    return () => {
      active = false;
      window.removeEventListener(DOWNLOADS_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [reload]);

  function toggle(item: OfflineDownload) {
    const audio = audioRef.current;

    if (!audio) return;

    setError(null);

    if (playingId === item.id) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    if (audio.getAttribute("src") !== item.src) {
      audio.src = item.src;
    }

    setPlayingId(item.id);

    void audio.play().catch(() => {
      setPlayingId(null);
      setError(labels.errors.play);
    });
  }

  async function remove(item: OfflineDownload) {
    if (!window.confirm(labels.deleteConfirm)) return;

    if (playingId === item.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }

    await removeDownload(item.id).catch(() => {});
  }

  async function clearAll() {
    if (!window.confirm(labels.clearConfirm)) return;

    audioRef.current?.pause();
    setPlayingId(null);
    await clearDownloads().catch(() => {});
  }

  if (items === null) {
    return <p className="text-sm text-muted">{labels.loading}</p>;
  }

  const used = totalSize(items);
  const ratio = Math.min(
    100,
    Math.round((used / OFFLINE_AUDIO_QUOTA_BYTES) * 100),
  );

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold">
          {variant === "offline" ? labels.offlineTitle : labels.used}
        </h2>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-subtle transition-colors hover:text-danger"
          >
            {labels.clear}
          </button>
        )}
      </div>

      {variant === "offline" && (
        <p className="mt-1 text-sm text-muted">{labels.offlineHint}</p>
      )}

      {items.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-subtle">
            <span>{labels.used}</span>
            <span className="font-mono">
              {formatBytes(used)} / {formatBytes(OFFLINE_AUDIO_QUOTA_BYTES)}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className={ratio >= 85 ? "h-full rounded-full bg-brand" : "h-full rounded-full bg-jade"}
              style={{ width: `${ratio}%` }}
            />
          </div>
          {ratio >= 85 && (
            <p className="mt-2 text-xs leading-relaxed text-brand">
              {labels.almostFull}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs leading-relaxed text-danger">{error}</p>
      )}

      {items.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-border px-4 py-6 text-center">
          <p className="text-sm text-muted">{labels.empty}</p>
          <p className="mt-1 text-xs text-subtle">{labels.emptyHint}</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-brand">
                <Music2 size={18} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="mt-0.5 truncate text-xs text-subtle">
                  {item.channelName} · {formatBytes(item.size)} ·{" "}
                  {labels.downloadedOn}{" "}
                  {formatDate(new Date(item.downloadedAt), locale)}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  aria-label={
                    playingId === item.id ? labels.pause : labels.play
                  }
                  title={playingId === item.id ? labels.pause : labels.play}
                  className="inline-flex size-9 items-center justify-center rounded-full bg-brand text-[#17130a] transition-colors hover:bg-brand-strong"
                >
                  {playingId === item.id ? (
                    <Pause size={15} />
                  ) : (
                    <Play size={15} className="ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => remove(item)}
                  aria-label={labels.delete}
                  title={labels.delete}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface-2 text-subtle transition-colors hover:text-danger"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs leading-relaxed text-subtle">{labels.hint}</p>

      <audio
        ref={audioRef}
        preload="metadata"
        className="hidden"
        onEnded={() => setPlayingId(null)}
        onError={() => {
          setPlayingId(null);
          setError(labels.errors.play);
        }}
      />
    </section>
  );
}
