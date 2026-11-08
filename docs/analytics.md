# Analítica

## Reglas de conteo

- **Solicitud bruta**: cada GET a `/media/audio/...`. Incluye bots, prefetch y rangos. HEAD no cuenta como descarga.
- **Cliente**: combinación de hash de IP + hash de user-agent. Si falta alguno, se usa el `requestId` para no agrupar clientes desconocidos.
- **Descarga válida**: un cliente cuenta una sola vez por episodio y día si la suma de bytes de sus rangos supera el umbral de consumo. Se excluyen bots, prefetch y HEAD.
- **Umbral**: `min(60 s, max(1 s, 10 % de la duración))`; se convierte a bytes con el tamaño total del episodio. Si faltan datos, se usa 1 MB.
- **Clientes únicos**: clientes no bot/prefetch con al menos una petición, aunque no alcancen el umbral.

La lista de bots se puede ampliar con `ANALYTICS_BOT_PATTERNS` (fragmentos de regex separados por coma).

## Agregados diarios

- Tabla `daily_stats` por `day` y `episodeId` con solicitudes, descargas válidas, inicios, escuchas verificadas, clientes únicos y bytes.
- La reconstrucción de un día es idempotente: borra e inserta el día completo en una transacción.
- El día se calcula en `ANALYTICS_TIMEZONE` (IANA; por defecto UTC).
- `reconcileDay(day)` compara los agregados contra los eventos crudos y devuelve diferencias.
- **Inicio**: evento de `/api/plays` (botón de reproducción).
- **Escucha verificada**: cliente que inició la escucha y además superó el umbral de descarga.

## Qué se mide

- **Descarga de servidor**: petición real a `/media/audio/...`, incluyendo peticiones por rango (206) y completas (200).
- **Inicio de escucha**: se medirá desde `/api/plays` en una fase posterior.
- **Escucha verificada**: requerirá umbral mínimo de consumo y deduplicación (fase posterior).

## Eventos crudos

Cada petición de audio genera una fila en `media_events`:

| Campo | Uso |
|---|---|
| `requestId` | Identificador de la petición para trazabilidad. |
| `episodeId`, `channelId` | Episodio y canal. |
| `method`, `status` | GET/HEAD y 200/206/416. |
| `rangeStart`, `rangeEnd`, `bytes` | Rango solicitado y bytes entregados. |
| `totalBytes`, `durationSec` | Tamaño y duración para el umbral de consumo. |
| `ipHash`, `uaHash` | SHA-256 con sal diaria; nunca se guarda la IP en claro. |
| `userAgent`, `refererHost` | Contexto de cliente; el referer se reduce al host. |
| `device`, `app`, `isBot`, `isPrefetch` | Clasificación para filtrar bots y prefetch. |
| `day`, `createdAt` | Día UTC y fecha exacta. |

## Retención

Los eventos crudos se conservan **90 días**. La limpieza se ejecuta una vez por proceso al abrir la base de analítica. Los agregados diarios se conservarán más tiempo cuando se implementen en #40.

## Privacidad

- No se guardan IPs ni identificadores de usuario en claro.
- El hash usa una sal diaria (`ANALYTICS_SALT` o `AUTH_SECRET`), de modo que no se puede reconstruir la IP y los hashes cambian cada día.
- No se usan cookies de terceros ni píxeles.
- El `user-agent` se guarda truncado a 400 caracteres y el referer solo como host.

## Limitaciones actuales

- Sin GeoIP propio: el país solo se registra si el proxy envía una cabecera de país.
- La deduplicación y el umbral de escucha verificada llegan en #39/#40.
- No es certificable IAB v2.2 todavía; la metodología completa se documentará en #42.
