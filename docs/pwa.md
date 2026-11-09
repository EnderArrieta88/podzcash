# PWA: instalación y modo offline

PodZcash se puede instalar como app (Android, iOS y escritorio) y muestra una
pantalla útil cuando no hay conexión. No hay app nativa todavía.

## Manifest e iconos

- `/manifest.webmanifest` se genera desde `src/lib/pwa.ts`
  (`src/app/manifest.ts`).
- `display: standalone`, `start_url` y `scope` en `/`, tema `#0b0d11`.
- Iconos en `public/icons/`:
  - `icon-192.png`
  - `icon-512.png`
  - `maskable-512.png` (zona segura del 80 %)
  - `apple-touch-icon.png` (180 px, sin transparencia)
- Se generan desde el mismo símbolo del favicon con
  `node scripts/generate-pwa-icons.mjs`.
- El favicon es `src/app/icon.svg`.

## Service worker

`public/sw.js`, registrado solo en producción desde
`src/components/pwa/service-worker-register.tsx`.

| Recurso | Estrategia |
|---|---|
| Navegaciones (HTML) | network-first; sin red responde `/offline`. El HTML **no** se cachea. |
| `/_next/static/`, `/icons/`, `/landing/` | cache-first con actualización en segundo plano. |
| `/media/audio/...` | cache-first si el episodio está descargado (incluye rangos 206); si no, red. |
| `/api/`, `/embed/` | siempre red. Nunca se cachean. |
| `/offline`, manifest, iconos | precacheados en la instalación, junto con los chunks de la pantalla offline. |

Decisiones:

- **No se cachea HTML** porque incluye el estado de sesión y contenido
  personalizado (estudio, canal, menú de cuenta). Servir una copia vieja podría
  mostrar una sesión cerrada o datos de otra visita.
- El audio descargado sí se cachea: es contenido público y el usuario lo pidió
  explícitamente. El streaming normal (sin descarga) sigue yendo a la red.

## Descargas offline

- Cada episodio publicado tiene un botón **Descargar** con progreso. El audio
  completo se guarda en Cache Storage (`podzcash-audio-v1`) y los metadatos en
  `localStorage` (`podzcash:downloads`).
- **Cuota por dispositivo:** `NEXT_PUBLIC_OFFLINE_AUDIO_QUOTA_MB` (1024 MB por
  defecto). Se compila en el bundle: cambiarla requiere rebuild. Se valida antes
  de descargar, con el `Content-Length` real y con `navigator.storage.estimate()`;
  cerca del 85 % se muestra un aviso.
- **Sin duplicados:** un guard por episodio en memoria, la comprobación de la
  caché y el botón deshabilitado mientras descarga.
- **`/descargas`:** lista las descargas con espacio usado, reproducir, borrar
  una o todas. Enlaces en el menú lateral, el menú móvil y el menú de cuenta.
- **Pantalla `/offline`:** además del aviso, lista las descargas y las reproduce.
  Al instalar el service worker se precachean su HTML y sus chunks, así que
  funciona en un arranque en frío sin red.
- **Rangos:** el service worker responde `206 Partial Content` desde la caché
  para que el reproductor pueda buscar dentro del episodio sin conexión.
- Las descargas sobreviven a actualizaciones del service worker: la caché de
  audio es independiente y no se borra con el versionado del shell.
- El shell offline es la pantalla `/offline` más los assets estáticos
  precacheados.

## Actualizaciones

- `VERSION` en `public/sw.js` versiona las cachés (`podzcash-shell-v1`,
  `podzcash-static-v1`). Al cambiarla, `activate` borra las cachés anteriores.
- El service worker hace `skipWaiting()` y `clients.claim()`: la versión nueva
  toma el control sin pedir confirmación.
- `public/sw.js` se sirve como archivo estático desde el hosting. El navegador
  revalida el script del service worker al actualizarlo (por especificación,
  salteando la caché HTTP), así que un deploy nuevo se detecta sin cabeceras
  extra. El scope `/` es el predeterminado porque el archivo está en la raíz.

## Instalación

- **Android/Chrome:** menú → “Instalar app”. Requiere HTTPS, manifest y service
  worker.
- **iOS/Safari:** compartir → “Añadir a pantalla de inicio”. Usa el
  `apple-touch-icon` y `apple-mobile-web-app-capable`.
- **Escritorio:** icono de instalación en la barra de direcciones.

## Alcance pendiente (épica #62)

- #67: spike de app nativa y CarPlay/Android Auto.
