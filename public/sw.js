/*
 * Service worker de PodZcash.
 *
 * Objetivo: que la app sea instalable, que los assets estáticos se sirvan
 * rápido y que, sin conexión, se vea una pantalla útil en lugar del error del
 * navegador.
 *
 * Decisiones:
 * - Las navegaciones son network-first y NO se cachean: el HTML incluye el
 *   estado de sesión y contenido personalizado. Sin red se responde `/offline`.
 * - `/_next/static`, iconos e imágenes de la landing usan cache-first con
 *   actualización en segundo plano.
 * - `/api`, `/media` y `/embed` siempre van a la red (audio y datos frescos).
 */
const VERSION = "v1";
const SHELL_CACHE = `podzcash-shell-${VERSION}`;
const STATIC_CACHE = `podzcash-static-${VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];

const NEVER_CACHE = ["/api/", "/media/", "/embed/"];
const STATIC_PREFIXES = ["/_next/static/", "/icons/", "/landing/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(PRECACHE);
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
          .filter((key) => key.startsWith("podzcash-") && !key.endsWith(VERSION))
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

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
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
