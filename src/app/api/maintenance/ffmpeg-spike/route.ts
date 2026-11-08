import { spawn, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Worker } from "node:worker_threads";
import { NextResponse } from "next/server";
import ffmpegPath from "ffmpeg-static";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ruta temporal de diagnóstico. Se elimina después del spike de #31.
const TOKEN = "0b54c861d07446749734f08fa20c124f8f2ceb531d604beab3ac3fe0dc2ba69b";
const DETACH_FILE = path.join(os.tmpdir(), "podzcash-detach-test");

function staticBinary(): string | null {
  const name = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  const candidates = [
    path.join(process.cwd(), "node_modules", "ffmpeg-static", name),
    ffmpegPath,
    path.join(
      process.cwd(),
      ".next",
      "standalone",
      "node_modules",
      "ffmpeg-static",
      name,
    ),
  ];

  return candidates.find((candidate) => candidate && existsSync(candidate)) ?? null;
}

function run(command: string, args: string[], timeout = 20_000) {
  const started = Date.now();
  const result = spawnSync(command, args, {
    encoding: "utf8",
    timeout,
    maxBuffer: 2 * 1024 * 1024,
  });

  return {
    command: [command, ...args].join(" "),
    status: result.status,
    error: result.error?.message ?? null,
    signal: result.signal ?? null,
    durationMs: Date.now() - started,
    stdout: (result.stdout ?? "").slice(0, 2000),
    stderr: (result.stderr ?? "").slice(0, 2000),
  };
}

function transcode(binary: string) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "podzcash-ffmpeg-"));
  const output = path.join(dir, "spike.mp3");

  try {
    const result = run(
      binary,
      [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:duration=1",
        "-c:a",
        "libmp3lame",
        "-b:a",
        "128k",
        output,
      ],
      30_000,
    );

    return {
      ...result,
      outputBytes: existsSync(output) ? readFileSync(output).length : 0,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function workerTest(): Promise<{ ok: boolean; value?: number; error?: string }> {
  return new Promise((resolve) => {
    const worker = new Worker(
      "require('node:worker_threads').parentPort.postMessage(6 * 7)",
      { eval: true },
    );

    const timeout = setTimeout(() => {
      void worker.terminate();
      resolve({ ok: false, error: "timeout" });
    }, 10_000);

    worker.once("message", (value) => {
      clearTimeout(timeout);
      void worker.terminate();
      resolve({ ok: true, value });
    });

    worker.once("error", (error) => {
      clearTimeout(timeout);
      resolve({ ok: false, error: error.message });
    });
  });
}

export async function GET(request: Request) {
  if (request.headers.get("x-spike-token") !== TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const action = new URL(request.url).searchParams.get("action") ?? "report";

  if (action === "worker") {
    return NextResponse.json(await workerTest());
  }

  if (action === "detach") {
    rmSync(DETACH_FILE, { force: true });
    const child = spawn(
      "/bin/sh",
      ["-c", `sleep 8; echo done > ${JSON.stringify(DETACH_FILE)}`],
      { detached: true, stdio: "ignore" },
    );
    child.unref();

    return NextResponse.json({ ok: true, pid: child.pid, file: DETACH_FILE });
  }

  if (action === "detach-status") {
    return NextResponse.json({
      exists: existsSync(DETACH_FILE),
      body: existsSync(DETACH_FILE)
        ? readFileSync(DETACH_FILE, "utf8").slice(0, 100)
        : null,
    });
  }

  const system = {
    which: run("sh", ["-lc", "command -v ffmpeg || true"]),
    version: run("sh", ["-lc", "ffmpeg -version 2>&1 | head -n 3 || true"]),
  };

  const staticPath = staticBinary();

  let staticInfo: Record<string, unknown> = {
    path: staticPath,
    exists: Boolean(staticPath),
  };

  if (staticPath) {
    let chmodError: string | null = null;

    try {
      chmodSync(staticPath, 0o755);
    } catch (error) {
      chmodError = error instanceof Error ? error.message : String(error);
    }

    staticInfo = {
      ...staticInfo,
      chmodError,
      version: run(staticPath, ["-version"]),
      transcode: transcode(staticPath),
    };
  }

  return NextResponse.json({
    ok: true,
    runtime: {
      node: process.version,
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      cpus: os.cpus().length,
      totalMem: os.totalmem(),
      freeMem: os.freemem(),
      uptime: os.uptime(),
      cwd: process.cwd(),
      tmpdir: os.tmpdir(),
      path: process.env.PATH,
      passenger: Object.fromEntries(
        Object.entries(process.env)
          .filter(([key]) => key.startsWith("PASSENGER_"))
          .map(([key, value]) => [key, value]),
      ),
    },
    limits: run("sh", ["-lc", "ulimit -a 2>&1 || true"]),
    system,
    static: staticInfo,
  });
}
