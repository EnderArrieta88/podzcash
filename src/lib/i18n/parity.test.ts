/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import type { Locale } from "./config";

const modules = import.meta.glob("./*.ts", { eager: true }) as Record<
  string,
  Record<string, unknown>
>;

const skipped = new Set(["./actions.ts", "./config.ts", "./locale.ts"]);

function isContent(value: unknown): value is Record<Locale, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "es" in value &&
    "en" in value
  );
}

function compare(
  es: unknown,
  en: unknown,
  path: string,
  problems: string[],
): void {
  if (typeof es === "string") {
    if (typeof en !== "string") {
      problems.push(`${path}: falta la traducción`);
      return;
    }

    if (es.trim() !== "" && en.trim() === "") {
      problems.push(`${path}: falta la traducción o está vacía`);
    }

    if (es.trim() === "" && en.trim() !== "") {
      problems.push(`${path}: sobra la traducción en inglés`);
    }

    return;
  }

  if (typeof es === "function") {
    if (typeof en !== "function") {
      problems.push(`${path}: se esperaba una función`);
    }
    return;
  }

  if (Array.isArray(es)) {
    if (!Array.isArray(en)) {
      problems.push(`${path}: se esperaba un array`);
      return;
    }

    if (es.length !== en.length) {
      problems.push(`${path}: array de ${es.length} vs ${en.length}`);
    }

    es.forEach((item, index) =>
      compare(item, en[index], `${path}[${index}]`, problems),
    );
    return;
  }

  if (es && typeof es === "object") {
    if (!en || typeof en !== "object" || Array.isArray(en)) {
      problems.push(`${path}: se esperaba un objeto`);
      return;
    }

    const esRecord = es as Record<string, unknown>;
    const enRecord = en as Record<string, unknown>;

    for (const key of Object.keys(esRecord)) {
      if (!(key in enRecord)) {
        problems.push(`${path}.${key}: falta en inglés`);
        continue;
      }

      compare(esRecord[key], enRecord[key], `${path}.${key}`, problems);
    }

    for (const key of Object.keys(enRecord)) {
      if (!(key in esRecord)) {
        problems.push(`${path}.${key}: sobra en inglés`);
      }
    }

    return;
  }

  if (es !== en) {
    problems.push(`${path}: valores primitivos distintos`);
  }
}

describe("paridad ES/EN", () => {
  it("todos los diccionarios tienen la misma forma y textos no vacíos", () => {
    const problems: string[] = [];

    for (const [file, exports] of Object.entries(modules)) {
      if (skipped.has(file)) continue;

      for (const [name, value] of Object.entries(exports)) {
        if (!isContent(value)) continue;
        compare(value.es, value.en, `${file}:${name}`, problems);
      }
    }

    expect(problems).toEqual([]);
  });
});
