"use client";

import type { RefObject } from "react";
import { ImagePlus } from "lucide-react";
import { FieldError } from "@/components/ui/field";
import type { StudioEpisodesContent } from "@/lib/i18n/studio-episodes";
import type { EpisodeCover } from "./use-episode-upload";

type Labels = StudioEpisodesContent["form"];

export function CoverField({
  cover,
  uploading,
  progress,
  labels,
  error,
  inputRef,
  onFile,
}: {
  cover: EpisodeCover | null;
  uploading: "audio" | "cover" | null;
  progress: number;
  labels: Labels;
  error?: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
}) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-text">
        {labels.cover}{" "}
        <span className="font-normal text-subtle">{labels.optional}</span>
      </span>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2 text-subtle transition-colors hover:border-border-strong"
          aria-label={labels.chooseCover}
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover.url} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center">
              <ImagePlus size={20} />
            </span>
          )}
        </button>

        <div className="text-sm text-muted">
          {uploading === "cover" ? (
            <span className="font-mono text-xs tabular">
              {labels.uploading} {progress}%
            </span>
          ) : (
            <span>
              {labels.coverHint}
              <span className="block text-xs text-subtle">
                {labels.coverFormats}
              </span>
            </span>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
