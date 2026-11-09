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
| `/api/`, `/media/`, `/embed/` | siempre red. Nunca se cachean. |
| `/offline`, manifest e iconos | precacheados en la instalación. |

Decisiones:

- **No se cachea HTML** porque incluye el estado de sesión y contenido
  personalizado (estudio, canal, menú de cuenta). Servir una copia vieja podría
  mostrar una sesión cerrada o datos de otra visita.
- El audio (`/media`) y la analítica (`/api`) siempre van a la red: el modo
  offline de audio es parte de #64.
- El shell offline es la pantalla `/offline` más los assets estáticos
  precacheados.

## Actualizaciones

- `VERSION` en `public/sw.js` versiona las cachés (`podzcash-shell-v1`,
  `podzcash-static-v1`). Al cambiarla, `activate` borra las cachés anteriores.
- El service worker hace `skipWaiting()` y `clients.claim()`: la versión nueva
  toma el control sin pedir confirmación.
- `/sw.js` se sirve con `Cache-Control: max-age=0, must-revalidate` y
  `Service-Worker-Allowed: /` (`next.config.ts`).

## Instalación

- **Android/Chrome:** menú → “Instalar app”. Requiere HTTPS, manifest y service
  worker.
- **iOS/Safari:** compartir → “Añadir a pantalla de inicio”. Usa el
  `apple-touch-icon` y `apple-mobile-web-app-capable`.
- **Escritorio:** icono de instalación en la barra de direcciones.

## Alcance pendiente (épica #62)

- #64: descarga de audio para escucha offline.
- #65: cola de reproducción y sleep timer.
- #66: sincronización de posición entre dispositivos.
- #67: spike de app nativa y CarPlay/Android Auto.
