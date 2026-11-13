import type { StudioEpisodesContent } from "@/lib/i18n/studio-episodes";

export type UploadResult = { key: string; size: number; mimeType: string };

export const MAX_AUDIO_BYTES = 300 * 1024 * 1024;
export const MAX_COVER_BYTES = 4 * 1024 * 1024;

export function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";

    audio.onloadedmetadata = () => {
      const value = Number.isFinite(audio.duration) ? audio.duration : null;
      URL.revokeObjectURL(url);
      resolve(value);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    audio.src = url;
  });
}

export function uploadWithProgress(
  kind: "audio" | "image",
  file: File,
  onProgress: (value: number) => void,
  errors: StudioEpisodesContent["form"]["errors"],
  purpose?: "cover",
): Promise<{ result?: UploadResult; error?: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `/api/upload?kind=${kind}${purpose ? `&purpose=${purpose}` : ""}`,
    );
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || "{}");

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ result: data as UploadResult });
        } else {
          const byCode: Record<string, string | undefined> = {
            unauthorized: errors.unauthorized,
            invalidType: errors.invalidType,
            unsupportedFormat: errors.unsupportedFormat,
            tooLarge: errors.tooLarge,
            noFile: errors.noFile,
            empty: errors.empty,
            saveFailed: errors.saveFailed,
            artworkFormat: errors.artworkFormat,
            artworkDimensions: errors.artworkDimensions,
            artworkColor: errors.artworkColor,
          };

          resolve({ error: byCode[data.error] ?? errors.uploadFailed });
        }
      } catch {
        resolve({ error: errors.badResponse });
      }
    };

    xhr.onerror = () => resolve({ error: errors.network });

    xhr.send(file);
  });
}
