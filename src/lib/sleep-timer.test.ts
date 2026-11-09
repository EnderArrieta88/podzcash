import { describe, expect, it } from "vitest";
import {
  formatSleepTimer,
  isSleepTimerDone,
  SLEEP_TIMER_OPTIONS,
  sleepTimerEnd,
  sleepTimerRemaining,
} from "./sleep-timer";

describe("temporizador de sueño", () => {
  it("ofrece las opciones habituales", () => {
    expect(SLEEP_TIMER_OPTIONS).toEqual([10, 20, 30, 45, 60]);
  });

  it("calcula el final y el tiempo restante", () => {
    const now = 1_000_000;
    const endsAt = sleepTimerEnd(10, now);

    expect(endsAt).toBe(now + 600_000);
    expect(sleepTimerRemaining(endsAt, now)).toBe(600_000);
    expect(sleepTimerRemaining(endsAt, now + 540_000)).toBe(60_000);
  });

  it("nunca devuelve un restante negativo", () => {
    expect(sleepTimerRemaining(1_000, 5_000)).toBe(0);
  });

  it("detecta cuándo terminó", () => {
    expect(isSleepTimerDone(null)).toBe(false);
    expect(isSleepTimerDone(2_000, 1_000)).toBe(false);
    expect(isSleepTimerDone(1_000, 1_000)).toBe(true);
    expect(isSleepTimerDone(500, 1_000)).toBe(true);
  });

  it("formatea el restante", () => {
    expect(formatSleepTimer(600_000)).toBe("10:00");
    expect(formatSleepTimer(61_000)).toBe("1:01");
    expect(formatSleepTimer(3_600_000)).toBe("1:00:00");
    expect(formatSleepTimer(-5)).toBe("0:00");
  });
});
