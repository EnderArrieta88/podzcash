# Rate limiting persistente

Los límites de login, comentarios, reportes y progreso viven en una base SQLite
separada. Antes eran un `Map` en memoria: se reiniciaban con el proceso y no se
compartían entre instancias.

## Cómo funciona

- Cada llamada usa una clave lógica (`login:<email>`, `comment:<userId>`,
  `report:<ip>`, etc.).
- La clave se guarda como **HMAC-SHA256** con `RATE_LIMIT_SALT` (o
  `AUTH_SECRET`). Nunca se almacena la IP, el email ni el id en claro.
- La base usa WAL, `busy_timeout = 5000` y transacciones `IMMEDIATE`, así que
  varios procesos de Passenger pueden compartir los contadores.
- Ventana fija por clave: al primer intento se crea con `reset_at = ahora +
  ventana`; los siguientes incrementan el contador. Al vencer, se reinicia.
- `clearLimit` borra la clave (se usa al autenticar o al completar una acción
  válida).

## Fallback

Si la base no se puede abrir o escribir, el módulo:

1. Registra el error.
2. Usa un contador en memoria durante **60 segundos** (misma semántica).
3. Reintenta la base después de ese período.

Así el sitio no queda sin protección si SQLite falla, a costa de perder
persistencia mientras dure el problema.

## Métricas

- `rate_limit_daily` agrega los límites alcanzados por día.
- Se conservan **90 días**.
- El panel de administración muestra **“Límites alcanzados hoy”**. Si el
  almacén está en modo memoria, la etiqueta lo indica.

## Retención y limpieza

- Al abrir la base (y como máximo una vez por hora) se borran los contadores
  vencidos y las métricas de más de 90 días.

## Límites actuales

| Acción | Clave | Límite |
|---|---|---|
| Login | `login:<email>` | 10 / 15 min |
| Recuperar contraseña | `reset:<email>` | 3 / 15 min |
| Verificar email | `verify:<email>` | 3 / 15 min |
| Comentarios | `comment:<userId>` | 5 / 10 min |
| Reportar comentario | `comment-report:<userId>` | 10 / 1 h |
| Reportar episodio/canal | `report:<ip>` | 5 / 1 h |
| Lista de espera | `waitlist:<ip>` | 3 / 15 min |
| Plays | `play:<ip>` | 120 / 1 h |
| Progreso del reproductor | `progress:<ip>` | 300 / 1 h |
| Sync de posición | `progress-sync:<userId>` | 120 / 10 min |

## Configuración

| Variable | Uso |
|---|---|
| `RATE_LIMIT_DB_PATH` | Ruta de la base. Por defecto `./.data/rate-limit.db`. |
| `RATE_LIMIT_SALT` | Sal del HMAC. Si falta, se usa `AUTH_SECRET`. |

No requiere migración de Prisma: la base se crea sola en la primera escritura.

## Tests

`src/lib/rate-limit.test.ts` cubre:

- permitir hasta el límite y bloquear,
- liberar cupo al vencer la ventana,
- claves independientes,
- persistencia entre instancias (reinicio),
- `clear`,
- que solo se guarde el hash,
- fallback a memoria cuando la base no está disponible.

El E2E usa una base aislada (`RATE_LIMIT_DB_PATH` en `playwright.config.ts`),
así los tests no arrastran límites entre ejecuciones.
