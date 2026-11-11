import { describe, expect, it } from "vitest";
import { cspMode, cspPolicy, randomNonce } from "./csp";

const base = { nonce: "abc123", mode: "enforce" as const };

describe("política CSP", () => {
  it("usa el nombre de enforce por defecto", () => {
    const policy = cspPolicy({ ...base, embed: false });

    expect(policy.name).toBe("Content-Security-Policy");
    expect(policy.value).toContain("nonce-abc123");
    expect(policy.value).toContain("frame-ancestors 'none'");
    expect(policy.value).toContain("report-uri /api/csp-report");
  });

  it("permite enmarcar solo los embeds", () => {
    const embed = cspPolicy({ ...base, embed: true });
    const app = cspPolicy({ ...base, embed: false });

    expect(embed.value).toContain("frame-ancestors *");
    expect(embed.value).not.toContain("frame-ancestors 'none'");
    expect(app.value).toContain("frame-ancestors 'none'");
  });

  it("usa Report-Only en el modo de observación", () => {
    const policy = cspPolicy({
      nonce: "n",
      embed: false,
      mode: "report-only",
    });

    expect(policy.name).toBe("Content-Security-Policy-Report-Only");
  });

  it("no permite scripts inline sin nonce", () => {
    const policy = cspPolicy({ ...base, embed: false });

    expect(policy.value).toContain(
      "script-src 'self' 'nonce-abc123' 'strict-dynamic'",
    );
    expect(policy.value).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });

  it("solo fuerza HTTPS cuando corresponde", () => {
    expect(cspPolicy({ ...base, embed: false }).value).toContain(
      "upgrade-insecure-requests",
    );
    expect(
      cspPolicy({ ...base, embed: false, https: false }).value,
    ).not.toContain("upgrade-insecure-requests");
  });

  it("normaliza el modo desde el entorno", () => {
    expect(cspMode("report-only")).toBe("report-only");
    expect(cspMode("enforce")).toBe("enforce");
    expect(cspMode(undefined)).toBe("enforce");
    expect(cspMode("otra-cosa")).toBe("enforce");
  });

  it("genera nonces distintos", () => {
    const a = randomNonce();
    const b = randomNonce();

    expect(a).toMatch(/^[a-f0-9]{32}$/);
    expect(a).not.toBe(b);
  });
});
