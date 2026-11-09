import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import { createRateLimitStore } from "./rate-limit";

const dirs: string[] = [];

function setup() {
  const dir = mkdtempSync(path.join(tmpdir(), "podzcash-rate-"));
  dirs.push(dir);

  const dbPath = path.join(dir, "rate.db");
  let clock = 1_700_000_000_000;

  const create = (pathOverride = dbPath) =>
    createRateLimitStore({
      path: pathOverride,
      salt: "test-salt",
      now: () => clock,
      log: () => {},
    });

  return {
    dir,
    dbPath,
    create,
    advance: (ms: number) => {
      clock += ms;
    },
  };
}

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("rate limit persistente", () => {
  it("permite hasta el límite y bloquea el siguiente", () => {
    const { create } = setup();
    const store = create();

    expect(store.take("ip:1", 2, 60_000)).toBe(true);
    expect(store.take("ip:1", 2, 60_000)).toBe(true);
    expect(store.take("ip:1", 2, 60_000)).toBe(false);
    expect(store.metrics()).toEqual({ blockedToday: 1, persistent: true });

    store.close();
  });

  it("libera el cupo al terminar la ventana", () => {
    const { create, advance } = setup();
    const store = create();

    expect(store.take("ip:1", 1, 60_000)).toBe(true);
    expect(store.take("ip:1", 1, 60_000)).toBe(false);

    advance(60_001);

    expect(store.take("ip:1", 1, 60_000)).toBe(true);
    store.close();
  });

  it("mantiene claves independientes", () => {
    const { create } = setup();
    const store = create();

    expect(store.take("a", 1, 60_000)).toBe(true);
    expect(store.take("b", 1, 60_000)).toBe(true);
    expect(store.take("a", 1, 60_000)).toBe(false);
    expect(store.take("b", 1, 60_000)).toBe(false);

    store.close();
  });

  it("sobrevive a un reinicio del proceso", () => {
    const { create } = setup();

    const first = create();
    expect(first.take("email:a@b.c", 1, 60_000)).toBe(true);
    first.close();

    const second = create();
    expect(second.take("email:a@b.c", 1, 60_000)).toBe(false);
    second.close();
  });

  it("clear reinicia el contador", () => {
    const { create } = setup();
    const store = create();

    expect(store.take("k", 1, 60_000)).toBe(true);
    expect(store.take("k", 1, 60_000)).toBe(false);

    store.clear("k");

    expect(store.take("k", 1, 60_000)).toBe(true);
    store.close();
  });

  it("guarda solo el hash de la clave", () => {
    const { create, dbPath } = setup();
    const store = create();

    store.take("persona@example.com", 1, 60_000);
    store.close();

    const db = new Database(dbPath, { readonly: true });
    const rows = db.prepare("SELECT key FROM rate_limits").all() as Array<{
      key: string;
    }>;
    db.close();

    expect(rows).toHaveLength(1);
    expect(rows[0].key).toMatch(/^[a-f0-9]{64}$/);
    expect(rows[0].key).not.toContain("persona");
  });

  it("cae a memoria si el almacén no está disponible", () => {
    const { dir } = setup();

    // Una carpeta no se puede abrir como base SQLite.
    const store = createRateLimitStore({
      path: dir,
      salt: "test-salt",
      now: () => 1_700_000_000_000,
      log: () => {},
    });

    expect(store.take("ip:1", 1, 60_000)).toBe(true);
    expect(store.take("ip:1", 1, 60_000)).toBe(false);
    expect(store.metrics()).toEqual({ blockedToday: 1, persistent: false });

    store.close();
  });
});
