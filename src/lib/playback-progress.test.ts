import { describe, expect, it } from "vitest";
import {
  clampProgress,
  isValidProgress,
  isResumable,
  pickLatestProgress,
  type ProgressPoint,
} from "./playback-progress";

const point = (
  positionSec: number,
  updatedAt: number,
  durationSec: number | null = 1800,
): ProgressPoint => ({ positionSec, durationSec, updatedAt });

describe("política de conflicto del progreso", () => {
  it("sin datos no devuelve nada", () => {
    expect(pickLatestProgress(null, null)).toEqual({
      point: null,
      source: null,
    });
  });

  it("usa el único lado disponible", () => {
    const local = point(120, 1_000);

    expect(pickLatestProgress(local, null)).toEqual({
      point: local,
      source: "local",
    });
    expect(pickLatestProgress(null, local)).toEqual({
      point: local,
      source: "remote",
    });
  });

  it("gana la posición más reciente", () => {
    const local = point(120, 2_000);
    const remote = point(300, 1_000);

    expect(pickLatestProgress(local, remote).source).toBe("local");
    expect(pickLatestProgress(local, remote).point?.positionSec).toBe(120);

    const newerRemote = point(90, 3_000);
    const result = pickLatestProgress(local, newerRemote);

    expect(result.source).toBe("remote");
    expect(result.point?.positionSec).toBe(90);
  });

  it("en empate gana el servidor", () => {
    const local = point(100, 5_000);
    const remote = point(200, 5_000);

    expect(pickLatestProgress(local, remote).source).toBe("remote");
  });
});

describe("isResumable", () => {
  it("no reanuda posiciones muy tempranas", () => {
    expect(isResumable(0, 1800)).toBe(false);
    expect(isResumable(2, 1800)).toBe(false);
    expect(isResumable(3, 1800)).toBe(true);
  });

  it("no reanuda si está prácticamente terminado", () => {
    expect(isResumable(1796, 1800)).toBe(false);
    expect(isResumable(1794, 1800)).toBe(true);
  });

  it("sin duración conocida solo exige un mínimo", () => {
    expect(isResumable(30, null)).toBe(true);
    expect(isResumable(1, null)).toBe(false);
  });

  it("rechaza valores inválidos", () => {
    expect(isResumable(Number.NaN, 1800)).toBe(false);
  });
});

describe("clampProgress", () => {
  it("acota a la duración y a cero", () => {
    expect(clampProgress(5000, 1800)).toBe(1800);
    expect(clampProgress(-10, 1800)).toBe(0);
    expect(clampProgress(42.5, null)).toBe(42.5);
  });
});

describe("isValidProgress", () => {
  it("valida la forma del progreso", () => {
    expect(isValidProgress(point(10, 1_000))).toBe(true);
    expect(
      isValidProgress({ positionSec: 10, durationSec: null, updatedAt: 1 }),
    ).toBe(true);
    expect(
      isValidProgress({ positionSec: -1, durationSec: null, updatedAt: 1 }),
    ).toBe(false);
    expect(isValidProgress({ positionSec: 10, durationSec: null })).toBe(false);
    expect(isValidProgress(null)).toBe(false);
  });
});
