# CSP y HSTS

La app envía una **Content-Security-Policy** global y HSTS endurecido desde
`src/proxy.ts` (el middleware de Next 16) y `next.config.ts`.

## Política

```
default-src 'self'
script-src 'self' 'nonce-<aleatorio>' 'strict-dynamic'
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob:
font-src 'self'
media-src 'self' blob:
connect-src 'self'
worker-src 'self' blob:
manifest-src 'self'
object-src 'none'
base-uri 'self'
form-action 'self'
frame-src 'none'
frame-ancestors 'none'   (en /embed: *)
upgrade-insecure-requests (solo sobre HTTPS)
report-uri /api/csp-report
```

Notas:

- **Scripts:** Next inserta un `<script>` inline para la hidratación. El proxy
  genera un nonce por request, lo pone en la cabecera de la request (para que
  Next lo aplique a sus scripts) y en la respuesta. No se usa
  `script-src 'unsafe-inline'`.
- **Estilos:** se permite `'unsafe-inline'` a propósito porque React usa
  atributos `style` (barras de progreso, QR, portadas) y `style-src` también
  cubre esos atributos.
- **Embeds:** solo `/embed/*` puede enmarcarse (`frame-ancestors *`). El resto
  usa `'none'` y además `X-Frame-Options: SAMEORIGIN`.
- **Media:** `blob:` cubre el audio generado/descargado en el navegador.
- **Reportes:** los navegadores envían violaciones a `/api/csp-report`, que
  registra la directiva y las rutas (sin query) en `stderr.log` con el prefijo
  `[csp]`. El endpoint tiene rate limit y no guarda IPs.

## Modos

| `CSP_MODE` | Cabecera | Efecto |
|---|---|---|
| `enforce` (por defecto) | `Content-Security-Policy` | Bloquea violaciones. |
| `report-only` | `Content-Security-Policy-Report-Only` | Solo reporta; no bloquea. |

Para observar sin riesgo:

1. Poner `CSP_MODE=report-only` en las variables de entorno de la app (cPanel)
   o en la variable de repositorio usada por el build.
2. Reiniciar la app.
3. Navegar por las páginas principales y revisar `[csp]` en `stderr.log`.
4. Volver a `CSP_MODE=enforce` y reiniciar.

Si el cambio de entorno no se aplica en runtime, el deploy compila con
`CSP_MODE` desde la variable de repositorio `CSP_MODE` (por defecto `enforce`).

## Rollback

- **CSP:** cambiar a `report-only` y reiniciar, o desplegar el commit anterior.
- **HSTS:** el header se puede bajar a `max-age=0` en `next.config.ts` y
  desplegar. Si el dominio se envió a la lista de preload, quitarlo tarda
  meses: no enviarlo sin revisar todos los subdominios.

## HSTS

`next.config.ts` envía:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

Antes de activarlo se comprobó:

- `podzcash.online` y `www` sirven por HTTPS.
- `mail`, `webmail` y `cpanel` responden por HTTPS.
- No hay wildcard DNS (`*.podzcash.online` no resuelve).
- `ftp.podzcash.online` no tiene sitio HTTPS, pero HSTS no afecta al protocolo
  FTP; solo a navegación web hacia ese subdominio.

`preload` es una señal: la inclusión real en la lista de Chrome es un trámite
manual en <https://hstspreload.org/>. No se envió; hacerlo compromete a todos
los subdominios a HTTPS durante meses.

## Tests

- `src/lib/csp.test.ts`: directivas, nonce, modo, embed y `upgrade-insecure`.
- `e2e/security.spec.ts`: CSP con nonce en el HTML, HSTS, excepción de embed y
  endpoint de reportes.
- El E2E corre con `CSP_MODE=enforce`, así que toda la suite valida que la
  política no rompe la app.
