"use client";

import { useEffect, useState } from "react";
import { Check, Download, Loader2, Trash2 } from "lucide-react";
import { formatBytes } from "@/lib/format";
import type { OfflineAudioContent } from "@/lib/i18n/offline-audio";
import {
  downloadEpisode,
  isDownloaded,
  OfflineAudioError,
  removeDownload,
  type DownloadInput,
} from "@/lib/offline-audio";

type Status = "loading" | "idle" | "downloading" | "done";

/**
 * Botón de descarga por episodio. Deshabilita mientras descarga, así un doble
 * clic no lanza dos descargas (`downloadEpisode` además deduplica por id).
 */
export function DownloadButton({
  download,
  labels,
}: {
  download: DownloadInput;
  labels: OfflineAudioContent;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void isDownloaded(download.id)
      .then((value) => {
        if (active) setStatus(value ? "done" : "idle");
      })
      .catch(() => {
        if (active) setStatus("idle");
      });

    return () => {
      active = false;
    };
  }, [download.id]);

  async function start() {
    if (status !== "idle") return;

    setError(null);
    setPercent(0);
    setStatus("downloading");

    try {
      await downloadEpisode(download, {
        onProgress: setPercent,
      });
      setStatus("done");
    } catch (caught) {
      setStatus("idle");
      setError(
        caught instanceof OfflineAudioError
          ? labels.errors[caught.code]
          : labels.errors.storage,
      );
    }
  }

  async function remove() {
    if (!window.confirm(labels.deleteConfirm)) return;

    setStatus("loading");

    try {
      await removeDownload(download.id);
      setStatus("idle");
    } catch {
      setStatus("done");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {status === "idle" && (
          <button
            type="button"
            onClick={start}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface-2 px-4 text-sm text-text transition-colors hover:bg-surface-3"
          >
            <Download size={15} />
            {labels.download}
            {download.size > 0 && (
              <span className="font-mono text-[11px] text-subtle">
                {formatBytes(download.size)}
              </span>
            )}
          </button>
        )}

        {status === "loading" && (
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface-2 px-4 text-sm text-subtle">
            <Loader2 size={15} className="animate-spin" />
            {labels.loading}
          </span>
        )}

        {status === "downloading" && (
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-brand/40 bg-brand-soft px-4 text-sm text-brand">
            <Loader2 size={15} className="animate-spin" />
            {labels.downloading}
            <span className="font-mono text-[11px]">{percent}%</span>
          </span>
        )}

        {status === "done" && (
          <>
            <span className="inline-flex h-9 items-center gap-2 rounded-full border border-jade/30 bg-jade-soft px-4 text-sm text-jade-bright">
              <Check size={15} />
              {labels.downloaded}
            </span>
            <button
              type="button"
              onClick={remove}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface-2 text-subtle transition-colors hover:text-danger"
              aria-label={labels.delete}
              title={labels.delete}
            >
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>

      {status === "downloading" && (
        <div className="mt-2 h-1 w-full max-w-56 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-brand transition-[width]"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {error && (
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
