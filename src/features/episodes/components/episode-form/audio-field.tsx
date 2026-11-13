"use client";

import type { RefObject } from "react";
import { CloudUpload, Music2, X } from "lucide-react";
import { FieldError } from "@/components/ui/field";
import { formatBytes, formatDuration } from "@/lib/format";
import type { StudioEpisodesContent } from "@/lib/i18n/studio-episodes";
import type { EpisodeAudio } from "./use-episode-upload";

type Labels = StudioEpisodesContent["form"];

export function AudioField({
  audio,
  duration,
  uploading,
  progress,
  dragging,
  labels,
  error,
  inputRef,
  onFile,
  onDraggingChange,
  onRemove,
}: {
  audio: EpisodeAudio | null;
  duration: number | null;
  uploading: "audio" | "cover" | null;
  progress: number;
  dragging: boolean;
  labels: Labels;
  error?: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
  onDraggingChange: (value: boolean) => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-text">
        {labels.audio}
      </span>

      {audio ? (
        <div className="flex items-center gap-3 rounded-[10px] border border-border bg-surface-2 p-4">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
            <Music2 size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{audio.name}</p>
            <p className="font-mono text-xs tabular text-subtle">
              {formatDuration(duration)} · {formatBytes(audio.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-danger/40 hover:text-danger"
            aria-label={labels.removeAudio}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            onDraggingChange(true);
          }}
          onDragLeave={() => onDraggingChange(false)}
          onDrop={(event) => {
            event.preventDefault();
            onDraggingChange(false);
            const file = event.dataTransfer.files?.[0];
            if (file) onFile(file);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed px-6 py-10 text-center transition-colors ${
            dragging
              ? "border-brand bg-brand-soft/40"
              : "border-border bg-surface-2 hover:border-border-strong"
          }`}
        >
          <CloudUpload size={22} className="text-subtle" />
          <p className="mt-3 text-sm">
            {uploading === "audio"
              ? `${labels.uploading} ${progress}%`
              : labels.dropHint}
          </p>
          <p className="mt-1 text-xs text-subtle">{labels.audioFormats}</p>

          {uploading === "audio" && (
            <div className="mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-brand transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      <FieldError>{error}</FieldError>
    </div>
  );
}
