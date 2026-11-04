"use client";

import { useActionState, useRef, useState } from "react";
import {
  CheckCircle2,
  CloudUpload,
  ImagePlus,
  Music2,
  X,
} from "lucide-react";
import { saveEpisodeAction } from "@/app/estudio/actions";
import {
  FieldError,
  FieldHint,
  Input,
  Label,
  Textarea,
} from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatBytes, formatDuration } from "@/lib/format";

type UploadResult = { key: string; size: number; mimeType: string };

type ExistingAudio = {
  key: string;
  size: number | null;
  mimeType: string | null;
  name: string;
  durationSec: number | null;
};

export type EpisodeFormValues = {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  tags: string;
  audio: ExistingAudio;
  coverKey: string | null;
  coverUrl: string | null;
};

const MAX_AUDIO_BYTES = 300 * 1024 * 1024;
const MAX_COVER_BYTES = 4 * 1024 * 1024;

function readDuration(file: File): Promise<number | null> {
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

function uploadWithProgress(
  kind: "audio" | "image",
  file: File,
  onProgress: (value: number) => void,
): Promise<{ result?: UploadResult; error?: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/upload?kind=${kind}`);
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
          resolve({ error: data.error ?? "No se pudo subir el archivo." });
        }
      } catch {
        resolve({ error: "Respuesta inesperada del servidor." });
      }
    };

    xhr.onerror = () => resolve({ error: "Error de red al subir el archivo." });

    xhr.send(file);
  });
}

export function EpisodeForm({ episode }: { episode: EpisodeFormValues | null }) {
  const [state, action] = useActionState(saveEpisodeAction, null);

  const [audio, setAudio] = useState<{
    key: string;
    size: number;
    mimeType: string;
    name: string;
  } | null>(
    episode
      ? {
          key: episode.audio.key,
          size: episode.audio.size ?? 0,
          mimeType: episode.audio.mimeType ?? "",
          name: episode.audio.name,
        }
      : null,
  );

  const [cover, setCover] = useState<{ key: string; url: string } | null>(
    episode?.coverKey && episode.coverUrl
      ? { key: episode.coverKey, url: episode.coverUrl }
      : null,
  );

  const [duration, setDuration] = useState<number | null>(
    episode?.audio.durationSec ?? null,
  );

  const [uploading, setUploading] = useState<"audio" | "cover" | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const audioInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  async function handleAudio(file: File) {
    if (!file.type.startsWith("audio/")) {
      setUploadError("Ese archivo no parece ser audio.");
      return;
    }

    if (file.size > MAX_AUDIO_BYTES) {
      setUploadError("El audio no puede pasar de 300 MB.");
      return;
    }

    setUploadError(null);
    setUploading("audio");
    setAudioProgress(0);

    const detected = await readDuration(file);
    if (detected) setDuration(detected);

    const { result, error } = await uploadWithProgress(
      "audio",
      file,
      setAudioProgress,
    );

    setUploading(null);

    if (error) {
      setUploadError(error);
      return;
    }

    if (result) {
      setAudio({
        key: result.key,
        size: result.size,
        mimeType: result.mimeType,
        name: file.name,
      });
      setAudioProgress(100);
    }
  }

  async function handleCover(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("La portada tiene que ser una imagen.");
      return;
    }

    if (file.size > MAX_COVER_BYTES) {
      setUploadError("La portada no puede pasar de 4 MB.");
      return;
    }

    setUploadError(null);
    setUploading("cover");
    setCoverProgress(0);

    const { result, error } = await uploadWithProgress(
      "image",
      file,
      setCoverProgress,
    );

    setUploading(null);

    if (error) {
      setUploadError(error);
      return;
    }

    if (result) {
      setCover({ key: result.key, url: `/media/${result.key}` });
      setCoverProgress(100);
    }
  }

  const busy = uploading !== null;
  const canSave = Boolean(audio) && !busy;

  return (
    <form action={action} className="space-y-7">
      <input type="hidden" name="id" value={episode?.id ?? ""} />
      <input type="hidden" name="audioKey" value={audio?.key ?? ""} />
      <input type="hidden" name="mimeType" value={audio?.mimeType ?? ""} />
      <input type="hidden" name="fileSize" value={audio?.size ?? ""} />
      <input type="hidden" name="durationSec" value={duration ?? ""} />
      <input type="hidden" name="coverKey" value={cover?.key ?? ""} />

      {state?.error && (
        <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      {uploadError && (
        <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {uploadError}
        </p>
      )}

      {/* Audio */}
      <div>
        <span className="mb-2 block text-sm font-medium text-text">Audio</span>

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
              onClick={() => {
                setAudio(null);
                setDuration(null);
                if (audioInput.current) audioInput.current.value = "";
              }}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-danger/40 hover:text-danger"
              aria-label="Quitar audio"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => audioInput.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                audioInput.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) void handleAudio(file);
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
                ? `Subiendo… ${audioProgress}%`
                : "Arrastra tu audio o haz clic para elegirlo"}
            </p>
            <p className="mt-1 text-xs text-subtle">
              MP3, M4A, WAV, FLAC, OGG o AAC · máximo 300 MB
            </p>

            {uploading === "audio" && (
              <div className="mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-brand transition-[width]"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        <input
          ref={audioInput}
          type="file"
          accept="audio/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleAudio(file);
          }}
        />
        <FieldError>{state?.fields?.audio}</FieldError>
      </div>

      {/* Portada */}
      <div>
        <span className="mb-2 block text-sm font-medium text-text">
          Portada <span className="font-normal text-subtle">(opcional)</span>
        </span>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => coverInput.current?.click()}
            className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2 text-subtle transition-colors hover:border-border-strong"
            aria-label="Elegir portada"
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
                Subiendo… {coverProgress}%
              </span>
            ) : (
              <span>
                Cuadrada, mínimo 1400×1400 px.
                <span className="block text-xs text-subtle">
                  JPG, PNG, WebP o GIF · máximo 4 MB
                </span>
              </span>
            )}
          </div>
        </div>

        <input
          ref={coverInput}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleCover(file);
          }}
        />
        <FieldError>{state?.fields?.cover}</FieldError>
      </div>

      {/* Metadatos */}
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          defaultValue={episode?.title ?? ""}
          required
          maxLength={140}
          placeholder="El título del episodio o la canción"
        />
        <FieldError>{state?.fields?.title}</FieldError>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-text">Tipo</span>
        <div className="flex gap-3">
          {[
            { value: "podcast", label: "Podcast" },
            { value: "music", label: "Música" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface-2 px-4 py-2.5 text-sm transition-colors has-checked:border-brand has-checked:bg-brand-soft/50 has-checked:text-brand"
            >
              <input
                type="radio"
                name="kind"
                value={option.value}
                defaultChecked={(episode?.kind ?? "podcast") === option.value}
                className="accent-[var(--color-brand)]"
              />
              {option.label}
            </label>
          ))}
        </div>
        <FieldError>{state?.fields?.kind}</FieldError>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={episode?.description ?? ""}
          rows={5}
          maxLength={5000}
          placeholder="De qué trata, quién participa, enlaces mencionados…"
        />
        <FieldError>{state?.fields?.description}</FieldError>
      </div>

      <div>
        <Label htmlFor="tags">Etiquetas</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={episode?.tags ?? ""}
          maxLength={240}
          placeholder="privacidad, zcash, entrevistas"
        />
        <FieldHint>Sepáralas con comas. Máximo 8.</FieldHint>
        <FieldError>{state?.fields?.tags}</FieldError>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <SubmitButton
          name="intent"
          value="publish"
          pendingLabel="Guardando…"
          disabled={!canSave}
        >
          <CheckCircle2 size={15} />
          Publicar
        </SubmitButton>

        <SubmitButton
          name="intent"
          value="draft"
          variant="secondary"
          pendingLabel="Guardando…"
          disabled={!canSave}
        >
          Guardar borrador
        </SubmitButton>

        {!audio && (
          <p className="text-xs text-subtle">
            Sube un audio para poder guardar.
          </p>
        )}
      </div>
    </form>
  );
}
