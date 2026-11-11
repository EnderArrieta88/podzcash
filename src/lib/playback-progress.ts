/**
 * Política de sincronización de la posición de reproducción.
 *
 * Regla: **gana la posición más reciente**. Si el empate es exacto, gana el
 * servidor. No se reanuda si la posición es muy temprana (< 3 s) o si está a
 * menos de 5 s del final (se considera terminado y se empieza de cero).
 *
 * Las marcas de tiempo se comparan entre el guardado local del dispositivo y
 * el `updatedAt` del servidor; se asume que los relojes están razonablemente
 * sincronizados (NTP).
 */
export const RESUME_MIN_SEC = 3;
export const RESUME_END_MARGIN_SEC = 5;

export type ProgressPoint = {
  positionSec: number;
  durationSec: number | null;
  /** Milisegundos desde epoch. */
  updatedAt: number;
};

export type ProgressSource = "local" | "remote";

export type LatestProgress = {
  point: ProgressPoint | null;
  source: ProgressSource | null;
};

export function isValidProgress(value: unknown): value is ProgressPoint {
  if (!value || typeof value !== "object") return false;

  const point = value as Partial<ProgressPoint>;

  return (
    typeof point.positionSec === "number" &&
    Number.isFinite(point.positionSec) &&
    point.positionSec >= 0 &&
    (point.durationSec === null ||
      (typeof point.durationSec === "number" &&
        Number.isFinite(point.durationSec) &&
        point.durationSec >= 0)) &&
    typeof point.updatedAt === "number" &&
    Number.isFinite(point.updatedAt)
  );
}

/** Elige la posición más reciente entre la local y la del servidor. */
export function pickLatestProgress(
  local: ProgressPoint | null,
  remote: ProgressPoint | null,
): LatestProgress {
  if (!local && !remote) return { point: null, source: null };
  if (!local) return { point: remote, source: "remote" };
  if (!remote) return { point: local, source: "local" };

  return remote.updatedAt >= local.updatedAt
    ? { point: remote, source: "remote" }
    : { point: local, source: "local" };
}

/** ¿Tiene sentido reanudar en esta posición? */
export function isResumable(
  positionSec: number,
  durationSec: number | null,
): boolean {
  if (!Number.isFinite(positionSec) || positionSec < RESUME_MIN_SEC) {
    return false;
  }

  if (
    durationSec != null &&
    Number.isFinite(durationSec) &&
    durationSec > 0 &&
    positionSec > durationSec - RESUME_END_MARGIN_SEC
  ) {
    return false;
  }

  return true;
}

export function clampProgress(
  positionSec: number,
  durationSec: number | null,
): number {
  if (!Number.isFinite(positionSec) || positionSec < 0) return 0;

  if (durationSec != null && Number.isFinite(durationSec) && durationSec > 0) {
    return Math.min(positionSec, durationSec);
  }

  return positionSec;
}
