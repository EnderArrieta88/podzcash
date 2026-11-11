/**
 * Descargas offline de audio.
 *
 * El audio se guarda en Cache Storage (el mismo que usa el service worker para
 * responder `/media/audio/...` sin red) y los metadatos en localStorage para
 * poder listar y reproducir las descargas sin consultar el servidor.
 *
 * El navegador puede borrar estas cachés bajo presión de espacio: `listDownloads`
 * descarta las entradas cuyo audio ya no existe.
 */
export const OFFLINE_AUDIO_CACHE = "podzcash-audio-v1";
export const DOWNLOADS_EVENT = "podzcash:downloads-changed";

const STORAGE_KEY = "podzcash:downloads";
const MEGABYTE = 1024 * 1024;

function configuredQuotaMb(): number {
  const raw = Number.parseInt(
    process.env.NEXT_PUBLIC_OFFLINE_AUDIO_QUOTA_MB ?? "",
    10,
  );

  return Number.isFinite(raw) && raw > 0 ? raw : 1024;
}

/** Cuota de descargas por dispositivo. Configurable en build. */
export const OFFLINE_AUDIO_QUOTA_BYTES = configuredQuotaMb() * MEGABYTE;

export type OfflineDownload = {
  id: string;
  title: string;
  channelName: string;
  channelHandle: string;
  coverUrl: string | null;
  src: string;
  size: number;
  downloadedAt: string;
};

export type DownloadInput = Omit<OfflineDownload, "downloadedAt">;

export type OfflineAudioErrorCode =
  "unsupported" | "quota" | "network" | "storage";

export class OfflineAudioError extends Error {
  code: OfflineAudioErrorCode;

  constructor(code: OfflineAudioErrorCode) {
    super(code);
    this.name = "OfflineAudioError";
    this.code = code;
  }
}

/** ¿Entra el archivo en la cuota configurada? */
export function fitsQuota(
  size: number,
  usage: number,
  quota = OFFLINE_AUDIO_QUOTA_BYTES,
): boolean {
  if (!Number.isFinite(size) || size <= 0) return false;
  return usage + size <= quota;
}

export function totalSize(items: OfflineDownload[]): number {
  return items.reduce((sum, item) => sum + (item.size || 0), 0);
}

function cacheAvailable(): boolean {
  return typeof caches !== "undefined" && typeof window !== "undefined";
}

function audioKey(src: string): string {
  return new URL(src, window.location.origin).toString();
}

function isDownload(value: unknown): value is OfflineDownload {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<OfflineDownload>;

  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.src === "string" &&
    typeof item.size === "number"
  );
}

function read(): OfflineDownload[] {
  if (typeof localStorage === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed.filter(isDownload) : [];
  } catch {
    return [];
  }
}

function persist(items: OfflineDownload[], notify: boolean): void {
  if (typeof localStorage === "undefined") return;

  try {
    if (items.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Sin espacio para metadatos: la descarga igual queda en caché.
  }

  if (notify && typeof window !== "undefined") {
    window.dispatchEvent(new Event(DOWNLOADS_EVENT));
  }
}

/**
 * Lista las descargas disponibles, descartando metadatos cuyo audio ya no está
 * en Cache Storage (por ejemplo, si el navegador liberó espacio).
 */
export async function listDownloads(): Promise<OfflineDownload[]> {
  const items = read();

  if (!cacheAvailable() || items.length === 0) return items;

  const cache = await caches.open(OFFLINE_AUDIO_CACHE);
  const valid: OfflineDownload[] = [];

  for (const item of items) {
    if (await cache.match(audioKey(item.src))) valid.push(item);
  }

  if (valid.length !== items.length) persist(valid, false);

  return valid;
}

export async function isDownloaded(id: string): Promise<boolean> {
  const items = await listDownloads();
  return items.some((item) => item.id === id);
}

const inFlight = new Map<string, Promise<void>>();

/**
 * Descarga un episodio completo y lo guarda para escucharlo sin red.
 * Si ya está descargado o hay una descarga en curso, no se duplica.
 */
export function downloadEpisode(
  input: DownloadInput,
  options: {
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
  } = {},
): Promise<void> {
  const existing = inFlight.get(input.id);

  if (existing) return existing;

  const task = runDownload(input, options).finally(() => {
    inFlight.delete(input.id);
  });

  inFlight.set(input.id, task);

  return task;
}

async function runDownload(
  input: DownloadInput,
  {
    onProgress,
    signal,
  }: { onProgress?: (percent: number) => void; signal?: AbortSignal },
): Promise<void> {
  if (!cacheAvailable()) throw new OfflineAudioError("unsupported");

  const key = audioKey(input.src);
  const cache = await caches.open(OFFLINE_AUDIO_CACHE);

  if (await cache.match(key)) {
    saveMetadata(input, input.size);
    onProgress?.(100);
    return;
  }

  const usage = totalSize(await listDownloads());

  if (input.size > 0 && !fitsQuota(input.size, usage)) {
    throw new OfflineAudioError("quota");
  }

  if (navigator.storage?.estimate) {
    const estimate = await navigator.storage.estimate().catch(() => null);

    if (estimate?.quota != null && estimate.usage != null) {
      // Deja un margen para metadatos, caché del shell y otros datos del sitio.
      const free = estimate.quota - estimate.usage - 5 * MEGABYTE;

      if (input.size > free) throw new OfflineAudioError("quota");
    }
  }

  let response: Response;

  try {
    response = await fetch(key, { cache: "no-store", signal });
  } catch {
    throw new OfflineAudioError("network");
  }

  if (!response.ok || !response.body) throw new OfflineAudioError("network");

  const total =
    Number(response.headers.get("content-length")) || input.size || 0;

  // El tamaño puede no conocerse antes de descargar: se valida al recibir
  // las cabeceras, antes de consumir el cuerpo.
  if (!fitsQuota(total, usage)) {
    await response.body.cancel().catch(() => {});
    throw new OfflineAudioError("quota");
  }

  let received = 0;

  const stream = response.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        received += chunk.byteLength;

        if (total > 0) {
          onProgress?.(
            Math.min(99, Math.max(1, Math.round((received / total) * 100))),
          );
        }

        controller.enqueue(chunk);
      },
    }),
  );

  const headers = new Headers({
    "Content-Type": response.headers.get("content-type") ?? "audio/mpeg",
    "Accept-Ranges": "bytes",
  });

  if (total > 0) headers.set("Content-Length", String(total));

  try {
    await cache.put(key, new Response(stream, { status: 200, headers }));
  } catch (error) {
    await cache.delete(key).catch(() => {});
    throw new OfflineAudioError(
      error instanceof DOMException && error.name === "QuotaExceededError"
        ? "quota"
        : "storage",
    );
  }

  saveMetadata(input, total || input.size);
  onProgress?.(100);
}

function saveMetadata(input: DownloadInput, size: number): void {
  const item: OfflineDownload = {
    ...input,
    size,
    downloadedAt: new Date().toISOString(),
  };

  const items = read().filter((entry) => entry.id !== input.id);
  persist([...items, item], true);
}

export async function removeDownload(id: string): Promise<void> {
  const items = read();
  const item = items.find((entry) => entry.id === id);

  if (!item) return;

  if (cacheAvailable()) {
    const cache = await caches.open(OFFLINE_AUDIO_CACHE);
    await cache.delete(audioKey(item.src)).catch(() => {});
  }

  persist(
    items.filter((entry) => entry.id !== id),
    true,
  );
}

export async function clearDownloads(): Promise<void> {
  if (cacheAvailable()) {
    await caches.delete(OFFLINE_AUDIO_CACHE).catch(() => {});
  }

  persist([], true);
}
