# Analítica

Esta página define qué mide PodZcash, cómo se deduplican las descargas, qué datos se conservan y qué limitaciones tiene la medición frente a IAB Podcast Measurement v2.2.

## Definiciones

- **Descarga de servidor**: cada petición real a `/media/audio/...`. Incluye respuestas completas (200) y por rango (206). Es lo que un servidor puede observar aunque la escucha ocurra en Apple Podcasts, Spotify u otra app.
- **Inicio de escucha**: el oyente pulsa play en el reproductor de PodZcash. Se registra desde `/api/plays`.
- **Escucha verificada**: un cliente que inició la escucha **y** superó el umbral mínimo de descarga del episodio.
- **Solicitud bruta**: cada GET de audio, incluso de bots, prefetch o rangos. HEAD no cuenta como descarga.
- **Descarga válida**: un cliente cuenta una sola vez por episodio y día si la suma de bytes de sus rangos supera el umbral. Se excluyen bots, prefetch y HEAD.
- **Cliente**: hash de IP + hash de user-agent. Si falta uno, se usa el `requestId` para no agrupar clientes desconocidos.
- **Clientes únicos**: clientes no bot/prefetch con al menos una petición, aunque no alcancen el umbral.

## Reglas de conteo

- **Ventana de deduplicación**: por episodio, cliente y día.
- **Umbral**: `min(60 s, max(1 s, 10 % de la duración))`, convertido a bytes con el tamaño total del episodio. Si faltan datos, se usa 1 MB.
- **Bots**: lista base de user-agents; se amplía con `ANALYTICS_BOT_PATTERNS` (fragmentos de regex separados por coma).
- **Prefetch**: se detecta por `purpose`, `sec-purpose`, `x-purpose` y `x-moz`.
- **Día analítico**: `ANALYTICS_TIMEZONE` (IANA, por defecto UTC).

### Ejemplo

Un episodio de 4 s y 64.044 bytes tiene un umbral de 1 s (25 % del archivo), es decir 16.011 bytes.

- Cliente A pide `bytes=0-19999` y luego `bytes=20000-39999`: 2 solicitudes, 1 descarga válida.
- Cliente B pide solo `bytes=0-999`: 1 solicitud, 0 descargas válidas (no alcanza el umbral).
- Un bot descarga el archivo completo: suma a solicitudes brutas, pero no a descargas válidas ni clientes.

## Modelo de datos

| Tabla | Contenido |
|---|---|
| `media_events` | Cada petición de audio: episodio, rango, bytes, estado, cliente hasheado, dispositivo, app, bot/prefetch. |
| `listen_events` | Inicios de escucha desde `/api/plays`. |
| `progress_events` | Hitos de progreso 25/50/75/100 % enviados por el reproductor. |
| `daily_stats` | Agregado idempotente por día y episodio: solicitudes, válidas, inicios, verificadas, clientes y bytes. |

`rebuildDay(day)` borra e inserta el día completo en una transacción. `reconcileDay(day)` compara los agregados con los eventos crudos.

## Dashboard y exportación

- `/estudio/episodios/<id>/analitica` muestra resumen, serie diaria, desglose por país/dispositivo/app y retención.
- Filtros: rango de fechas, país, dispositivo y app.
- La retención cuenta clientes únicos que llegaron a cada decil, según los hitos del reproductor.
- El CSV incluye la serie diaria y una fila `total` con los mismos números del resumen.

## Retención de datos

- **Eventos crudos** (`media_events`, `listen_events`, `progress_events`): **90 días**. La limpieza se ejecuta una vez por proceso al abrir la base.
- **Agregados diarios** (`daily_stats`): se conservan indefinidamente; no contienen IP ni user-agent.
- La retención por episodio se calcula sobre los eventos crudos; por eso la curva de retención cubre como máximo los últimos 90 días.

## Privacidad

- No se guardan IPs ni identificadores de usuario en claro.
- `ipHash` y `uaHash` usan SHA-256 con una **sal diaria** (`ANALYTICS_SALT` o `AUTH_SECRET`); los hashes cambian cada día y no permiten reconstruir la IP.
- El `user-agent` se guarda truncado a 400 caracteres y el referer solo como host.
- No se usan cookies de terceros, píxeles ni redes publicitarias.
- Los derechos de acceso, rectificación y eliminación se describen en la [política de privacidad](/privacidad).

## Limitaciones frente a IAB v2.2

PodZcash **no está certificado por IAB Tech Lab**. La medición es una implementación propia inspirada en las buenas prácticas, no una certificación.

Limitaciones actuales:

- **Descargas externas**: solo se ven las peticiones que llegan al servidor. Cachés de apps, proxies del hosting y descargas previas pueden ocultar o duplicar tráfico.
- **Identidad aproximada**: IP + user-agent no identifica personas. IPs compartidas pueden unir oyentes y IPs dinámicas pueden separarlos; la sal diaria impide deduplicar entre días.
- **Bots**: la lista es heurística y configurable; no usa la lista oficial de IAB.
- **Progreso**: los hitos de retención los envía el reproductor web. Si el oyente cierra la pestaña o pierde red, el evento puede perderse; no hay verificación de finalización en servidor.
- **País**: solo se registra si el proxy envía una cabecera de país. No hay base GeoIP propia.
- **Dispositivo/app**: se infieren del user-agent, no de una app con SDK.
- **Publicidad**: no hay métricas de impresiones, DAI ni atribución.

Para una certificación IAB v2.2 haría falta, como mínimo: auditoría de IAB Tech Lab, definición formal de descarga válida, filtrado y deduplicación auditables, documentación de limitaciones, y validación independiente de los números.

## Configuración

| Variable | Uso |
|---|---|
| `ANALYTICS_DB_PATH` | Ruta de la base SQLite de analítica. |
| `ANALYTICS_SALT` | Sal para hashear IP y user-agent; si falta se usa `AUTH_SECRET`. |
| `ANALYTICS_TIMEZONE` | Zona IANA para el corte diario; por defecto UTC. |
| `ANALYTICS_BOT_PATTERNS` | Patrones extra de bots separados por coma. |
