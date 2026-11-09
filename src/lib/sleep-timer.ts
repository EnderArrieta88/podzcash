/** Opciones del temporizador de sueño, en minutos. */
export const SLEEP_TIMER_OPTIONS = [10, 20, 30, 45, 60] as const;

export function sleepTimerEnd(minutes: number, now = Date.now()): number {
  return now + minutes * 60_000;
}

export function sleepTimerRemaining(endsAt: number, now = Date.now()): number {
  return Math.max(0, endsAt - now);
}

export function isSleepTimerDone(
  endsAt: number | null,
  now = Date.now(),
): boolean {
  return endsAt !== null && endsAt <= now;
}

/** Formatea el tiempo restante como `m:ss` o `h:mm:ss`. */
export function formatSleepTimer(remainingMs: number): string {
  const total = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = String(total % 60).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`;
  }

  return `${minutes}:${seconds}`;
}
