"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

export function BannerField({
  initialUrl,
  labels,
}: {
  initialUrl: string | null;
  labels: {
    banner: string;
    bannerAlt: string;
    uploadBanner: string;
    bannerHint: string;
  };
}) {
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const objectUrl = useRef<string | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }

    if (!file) {
      setPreview(initialUrl);
      return;
    }

    objectUrl.current = URL.createObjectURL(file);
    setPreview(objectUrl.current);
  }

  return (
    <div className="space-y-3">
      <span className="block text-sm font-medium text-text">
        {labels.banner}
      </span>

      <div className="relative aspect-[3/1] w-full overflow-hidden rounded-xl border border-border bg-surface-2">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={labels.bannerAlt}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[radial-gradient(120%_120%_at_20%_0%,rgba(244,183,40,0.18),rgba(16,185,129,0.06)_45%,transparent_75%)] text-subtle">
            <ImagePlus size={22} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface-2 px-4 text-sm text-text transition-colors hover:bg-border">
          {labels.uploadBanner}
          <input
            type="file"
            name="banner"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleChange}
            className="sr-only"
          />
        </label>
        <p className="text-xs text-subtle">{labels.bannerHint}</p>
      </div>
    </div>
  );
}
