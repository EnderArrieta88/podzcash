import { describe, expect, it } from "vitest";
import { formatBytes, formatDuration } from "./format";

describe("formatDuration", () => {
  it("devuelve un marcador para valores vacíos", () => {
    expect(formatDuration(null)).toBe("--:--");
    expect(formatDuration(0)).toBe("--:--");
  });

  it("formatea minutos y segundos", () => {
    expect(formatDuration(65)).toBe("1:05");
  });

  it("incluye horas cuando hace falta", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
  });
});

describe("formatBytes", () => {
  it("usa unidades legibles", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
  });
});
