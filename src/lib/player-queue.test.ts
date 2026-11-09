import { describe, expect, it } from "vitest";
import {
  addToQueue,
  canGoNext,
  isTrackLike,
  moveQueueItem,
  nextTrack,
  parseQueue,
  previousTrack,
  removeFromQueue,
} from "./player-queue";

const track = (id: string) => ({ id });

describe("cola de reproducción", () => {
  it("agrega al final sin duplicados", () => {
    const queue = addToQueue([track("a")], track("b"));

    expect(queue.map((item) => item.id)).toEqual(["a", "b"]);
    expect(addToQueue(queue, track("a"))).toBe(queue);
  });

  it("quita una pista por id", () => {
    expect(
      removeFromQueue([track("a"), track("b")], "a").map((item) => item.id),
    ).toEqual(["b"]);
    expect(removeFromQueue([track("a")], "zzz")).toHaveLength(1);
  });

  it("mueve una pista arriba y abajo respetando los bordes", () => {
    const queue = [track("a"), track("b"), track("c")];

    expect(
      moveQueueItem(queue, "b", -1).map((item) => item.id),
    ).toEqual(["b", "a", "c"]);
    expect(
      moveQueueItem(queue, "b", 1).map((item) => item.id),
    ).toEqual(["a", "c", "b"]);
    expect(moveQueueItem(queue, "a", -1)).toBe(queue);
    expect(moveQueueItem(queue, "c", 1)).toBe(queue);
    expect(moveQueueItem(queue, "zzz", 1)).toBe(queue);
  });

  it("calcula la pista siguiente", () => {
    const queue = [track("a"), track("b"), track("c")];

    expect(nextTrack(queue, "a")?.id).toBe("b");
    expect(nextTrack(queue, "c")).toBeNull();
    expect(nextTrack(queue, null)?.id).toBe("a");
    expect(nextTrack(queue, "zzz")?.id).toBe("a");
    expect(nextTrack([], "a")).toBeNull();
    expect(canGoNext(queue, "b")).toBe(true);
    expect(canGoNext(queue, "c")).toBe(false);
  });

  it("calcula la pista anterior", () => {
    const queue = [track("a"), track("b"), track("c")];

    expect(previousTrack(queue, "c")?.id).toBe("b");
    expect(previousTrack(queue, "a")).toBeNull();
    expect(previousTrack(queue, null)).toBeNull();
    expect(previousTrack(queue, "zzz")).toBeNull();
  });
});

describe("restauración de la cola", () => {
  const valid = {
    id: "ep",
    title: "Episodio",
    channelName: "Canal",
    channelHandle: "canal",
    coverUrl: null,
    src: "/media/audio/canal/ep.mp3",
    durationSec: 120,
  };

  it("valida pistas restauradas", () => {
    expect(isTrackLike(valid)).toBe(true);
    expect(isTrackLike({ ...valid, id: 3 })).toBe(false);
    expect(isTrackLike(null)).toBe(false);
  });

  it("parsea y descarta entradas inválidas", () => {
    const raw = JSON.stringify([valid, { id: "roto" }, "texto"]);

    expect(parseQueue(raw)).toEqual([valid]);
    expect(parseQueue(null)).toEqual([]);
    expect(parseQueue("{")).toEqual([]);
  });
});
