# Analítica

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
