import { describe, expect, it } from "vitest";
import {
  fitsQuota,
  OFFLINE_AUDIO_QUOTA_BYTES,
  totalSize,
  type OfflineDownload,
} from "./offline-audio";

const MB = 1024 * 1024;

function item(size: number): OfflineDownload {
  return {
    id: `ep-${size}`,
    title: "Episodio",
    channelName: "Canal",
    channelHandle: "canal",
    coverUrl: null,
    src: "/media/audio/canal/ep.mp3",
    size,
    downloadedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("fitsQuota", () => {
  it("acepta archivos que entran en la cuota", () => {
    expect(fitsQuota(10 * MB, 100 * MB, 200 * MB)).toBe(true);
    expect(fitsQuota(100 * MB, 100 * MB, 200 * MB)).toBe(true);
  });

  it("rechaza archivos que la superan", () => {
    expect(fitsQuota(101 * MB, 100 * MB, 200 * MB)).toBe(false);
    expect(fitsQuota(1 * MB, 200 * MB, 200 * MB)).toBe(false);
  });

  it("rechaza tamaños inválidos", () => {
    expect(fitsQuota(0, 0, 200 * MB)).toBe(false);
    expect(fitsQuota(Number.NaN, 0, 200 * MB)).toBe(false);
  });

  it("usa una cuota por defecto positiva", () => {
    expect(OFFLINE_AUDIO_QUOTA_BYTES).toBeGreaterThan(0);
  });
});

describe("totalSize", () => {
  it("suma los tamaños de las descargas", () => {
    expect(totalSize([])).toBe(0);
    expect(totalSize([item(1 * MB), item(2 * MB)])).toBe(3 * MB);
  });
});
