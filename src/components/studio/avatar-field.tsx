"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

export function AvatarField({
  initialUrl,
  labels,
}: {
  initialUrl: string | null;
  labels: {
    avatar: string;
    avatarAlt: string;
    uploadImage: string;
    avatarHint: string;
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
        {labels.avatar}
      </span>

      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-border bg-surface-2">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={labels.avatarAlt}
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-subtle">
              <ImagePlus size={20} />
            </span>
          )}
        </div>

        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface-2 px-4 text-sm text-text transition-colors hover:bg-border">
          {labels.uploadImage}
          <input
            type="file"
            name="avatar"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleChange}
            className="sr-only"
          />
        </label>
      </div>

      <p className="text-xs text-subtle">{labels.avatarHint}</p>
    </div>
  );
}
