/*
 * Service worker de PodZcash.
 *
 * Objetivo: app instalable, assets estáticos rápidos, pantalla offline útil y
 * reproducción de los episodios descargados sin conexión.
 *
 * Decisiones:
 * - Las navegaciones son network-first y NO se cachean: el HTML incluye el
 *   estado de sesión y contenido personalizado. Sin red se responde `/offline`,
 *   que sí se precachea junto con sus scripts para que funcione el listado de
 *   descargas.
 * - `/_next/static`, iconos e imágenes de la landing usan cache-first con
 *   actualización en segundo plano.
 * - `/api` y `/embed` siempre van a la red.
 * - `/media/audio` se sirve desde la caché de descargas si el episodio está
 *   descargado, incluidos los rangos (206) que pide el reproductor.
 */
const VERSION = "v3";
const SHELL_CACHE = `podzcash-shell-${VERSION}`;
const STATIC_CACHE = `podzcash-static-${VERSION}`;
const AUDIO_CACHE = "podzcash-audio-v1";
const OFFLINE_URL = "/offline";
const AUDIO_PREFIX = "/media/audio/";

const PRECACHE = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];

const NEVER_CACHE = ["/api/", "/embed/"];
const STATIC_PREFIXES = ["/_next/static/", "/icons/", "/landing/"];

/**
 * Guarda la pantalla offline y los chunks que necesita para hidratarse.
 * Sin los scripts, la lista de descargas no aparecería sin conexión.
 */
async function precacheOfflineShell(shell) {
  const response = await fetch(OFFLINE_URL, { cache: "reload" });

  if (!response.ok) throw new Error(`offline ${response.status}`);

  await shell.put(OFFLINE_URL, response.clone());

  const html = await response.text();
  const assets = new Set();
  const pattern = /(?:src|href)="(\/_next\/static\/[^"]+)"/g;
  let match;

  while ((match = pattern.exec(html))) assets.add(match[1]);

  const staticCache = await caches.open(STATIC_CACHE);

  await Promise.all(
    [...assets].map(async (url) => {
      try {
        const asset = await fetch(url, { cache: "reload" });
        if (asset.ok) await staticCache.put(url, asset);
      } catch {
        // Un asset que falla no debe romper la instalación del SW.
      }
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL_CACHE);

      await shell.addAll(PRECACHE);

      await precacheOfflineShell(shell).catch((error) => {
        console.warn("[sw] No se pudo precachear la pantalla offline:", error);
      });

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(
            (key) =>
              (key.startsWith("podzcash-shell-") ||
                key.startsWith("podzcash-static-")) &&
              !key.endsWith(VERSION),
          )
          .map((key) => caches.delete(key)),
      );

      await self.clients.claim();
    })(),
  );
});

async function offlineResponse() {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(OFFLINE_URL);

  return cached ?? Response.error();
}

/**
 * Avisos de la lista de espera. Solo los administradores se suscriben y solo
 * desde el teléfono; el servidor filtra las suscripciones móviles.
 */
self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = typeof payload.title === "string" ? payload.title : "PodZcash";
  const options = {
    body: typeof payload.body === "string" ? payload.body : "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: typeof payload.tag === "string" ? payload.tag : "podzcash",
    renotify: true,
    data: {
      url: typeof payload.url === "string" ? payload.url : "/estudio/admin",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = event.notification.data?.url || "/estudio/admin";

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windows) {
        if (new URL(client.url).origin !== self.location.origin) continue;

        await client.focus();

        if ("navigate" in client) {
          await client.navigate(target).catch(() => {});
        }

        return;
      }

      await self.clients.openWindow(target);
    })(),
  );
});

function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec((header || "").trim());

  if (!match) return null;

  const [, startRaw, endRaw] = match;
  let start = startRaw ? Number.parseInt(startRaw, 10) : 0;
  let end = endRaw ? Number.parseInt(endRaw, 10) : size - 1;

  // Rango sufijo: "bytes=-500" = últimos 500 bytes.
  if (!startRaw && endRaw) {
    start = Math.max(size - Number.parseInt(endRaw, 10), 0);
    end = size - 1;
  }

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start >= size ||
    start > end
  ) {
    return { invalid: true };
  }

  return { start, end: Math.min(end, size - 1) };
}

async function handleAudio(request) {
  const url = new URL(request.url);
  const cache = await caches.open(AUDIO_CACHE);
  const key = new Request(`${url.origin}${url.pathname}`);
  const cached = await cache.match(key);

  // Sin descarga local se sigue usando el servidor (streaming normal).
  if (!cached) return fetch(request);

  const blob = await cached.blob();
  const type = cached.headers.get("content-type") || "audio/mpeg";
  const size = blob.size;
  const range = parseRange(request.headers.get("range"), size);

  if (request.headers.get("range") && range?.invalid) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    });
  }

  if (!range) {
    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Content-Length": String(size),
        "Accept-Ranges": "bytes",
      },
    });
  }

  const { start, end } = range;

  return new Response(blob.slice(start, end + 1), {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "Content-Type": type,
      "Content-Length": String(end - start + 1),
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
    },
  });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith(AUDIO_PREFIX)) {
    event.respondWith(handleAudio(request));
    return;
  }

  if (NEVER_CACHE.some((prefix) => url.pathname.startsWith(prefix))) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          return offlineResponse();
        }
      })(),
    );
    return;
  }

  if (STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);

        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => null);

        return cached ?? (await network) ?? Response.error();
      })(),
    );
  }
});
